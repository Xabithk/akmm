const NEWS_KEY = "akmmiac-demo-news";
const ENQUIRIES_KEY = "akmmiac-demo-enquiries";
const accessScreen = document.querySelector("#access-screen");
const adminApp = document.querySelector("#admin-app");
const toast = document.querySelector("#toast");
let toastTimer;

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function safeText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formattedDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Date pending" : new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
}

function setView(name) {
  document.querySelectorAll(".view-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `view-${name}`));
  document.querySelectorAll(".admin-nav-item").forEach((button) => button.classList.toggle("active", button.dataset.view === name));
  const active = document.querySelector(`#view-${name}`);
  document.querySelector("#breadcrumb").textContent = active?.querySelector("h1")?.textContent || "Overview";
  document.querySelector("#sidebar").classList.remove("open");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateOverview() {
  const news = readList(NEWS_KEY);
  const enquiries = readList(ENQUIRIES_KEY);
  document.querySelector("#overview-enquiries").textContent = enquiries.length;
  document.querySelector("#overview-notices").textContent = news.length;
  document.querySelector("#admission-count").textContent = enquiries.length;
  document.querySelector("#notice-count").textContent = news.length;
  const recent = document.querySelector("#recent-activity");
  recent.innerHTML = news.length ? news.slice(0, 4).map((item) => `<div class="activity-row"><time>${formattedDate(item.date)}</time><span><strong>${safeText(item.title)}</strong><small>${safeText(item.category)}</small></span><span>Local</span></div>`).join("") : "<p class=\"empty-state\">No notices have been published in this preview.</p>";
}

function renderNotices() {
  const notices = readList(NEWS_KEY);
  const container = document.querySelector("#notice-list");
  container.innerHTML = notices.length ? notices.map((notice, index) => `<article class="notice-row"><span><strong>${safeText(notice.title)}</strong><small>${safeText(notice.category)} · ${formattedDate(notice.date)}</small><small>${safeText(notice.description)}</small></span><button type="button" data-delete-notice="${index}">Delete</button></article>`).join("") : "<p class=\"empty-state\">No demo notices saved in this browser.</p>";
}

function renderEnquiries(search = "") {
  const enquiries = readList(ENQUIRIES_KEY).filter((entry) => `${entry.studentName} ${entry.guardianName} ${entry.phone} ${entry.programme}`.toLowerCase().includes(search.toLowerCase()));
  const tableBody = document.querySelector("#enquiry-rows");
  const empty = document.querySelector("#enquiry-empty");
  tableBody.innerHTML = enquiries.map((entry) => `<tr><td><strong>${safeText(entry.studentName)}</strong><br>${safeText(entry.guardianName || "")}</td><td>${safeText(entry.phone)}</td><td>${safeText(entry.programme)}</td><td>${formattedDate((entry.createdAt || "").slice(0, 10))}</td><td><span class="table-status">New · Demo</span></td></tr>`).join("");
  empty.style.display = enquiries.length ? "none" : "block";
}

function exportEnquiries() {
  const enquiries = readList(ENQUIRIES_KEY);
  if (!enquiries.length) return showToast("No local demo enquiries to export.");
  const fields = ["studentName", "guardianName", "phone", "email", "programme", "message", "createdAt"];
  const csv = [fields.join(","), ...enquiries.map((entry) => fields.map((field) => `"${String(entry[field] || "").replaceAll('"', '""')}"`).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "akmmiac-demo-enquiries.csv";
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#today-label").textContent = new Intl.DateTimeFormat("en", { dateStyle: "full" }).format(new Date());
document.querySelector("#notice-form [name=date]").value = new Date().toISOString().slice(0, 10);

document.querySelector("#preview-button").addEventListener("click", () => {
  accessScreen.hidden = true;
  adminApp.hidden = false;
  updateOverview();
  renderNotices();
  renderEnquiries();
});

document.querySelector("#exit-preview").addEventListener("click", () => {
  adminApp.hidden = true;
  accessScreen.hidden = false;
});

document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
document.querySelectorAll("[data-open-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.openView)));
document.querySelectorAll("[data-view-link]").forEach((link) => link.addEventListener("click", () => setView(link.dataset.viewLink)));
document.querySelector("#sidebar-toggle").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));
document.querySelector("#profile-button").addEventListener("click", () => showToast("Preview profile only. No account is signed in."));

document.querySelector("#notice-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const notice = Object.fromEntries(new FormData(event.currentTarget));
  const notices = readList(NEWS_KEY);
  notices.unshift(notice);
  localStorage.setItem(NEWS_KEY, JSON.stringify(notices));
  renderNotices();
  updateOverview();
  event.currentTarget.reset();
  event.currentTarget.querySelector('[name="date"]').value = new Date().toISOString().slice(0, 10);
  showToast("Preview notice saved in this browser only.");
});

document.querySelector("#notice-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete-notice]");
  if (!button) return;
  const notices = readList(NEWS_KEY);
  notices.splice(Number(button.dataset.deleteNotice), 1);
  localStorage.setItem(NEWS_KEY, JSON.stringify(notices));
  renderNotices();
  updateOverview();
  showToast("Preview notice deleted.");
});

document.querySelector("#enquiry-search").addEventListener("input", (event) => renderEnquiries(event.currentTarget.value));
document.querySelector("#export-enquiries").addEventListener("click", exportEnquiries);

window.addEventListener("storage", () => {
  updateOverview();
  renderNotices();
  renderEnquiries(document.querySelector("#enquiry-search").value);
});