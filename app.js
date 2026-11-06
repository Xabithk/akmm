const STORAGE = { news: "akmmiac-demo-news", enquiries: "akmmiac-demo-enquiries" };
const defaultNews = [];
const newsList = document.querySelector("#news-list");
const emptyNews = document.querySelector("#empty-news");
const modalBackdrop = document.querySelector("#modal-backdrop");
const modalContent = document.querySelector("#modal-content");
const toast = document.querySelector("#toast");
let previousFocus = null;
let toastTimer;

document.querySelector("#current-year").textContent = new Date().getFullYear();

const revealElements = document.querySelectorAll(".reveal");
function revealVisibleElements() {
  revealElements.forEach((element) => {
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) {
      element.classList.add("is-visible");
    }
  });
}
revealVisibleElements();
window.addEventListener("scroll", revealVisibleElements, { passive: true });
window.addEventListener("resize", revealVisibleElements);

function readStorage(key, fallback = []) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function announce(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

function renderNews(query = "") {
  const entries = readStorage(STORAGE.news, defaultNews);
  const matching = entries.filter((entry) => `${entry.title} ${entry.description} ${entry.category}`.toLowerCase().includes(query.toLowerCase()));
  newsList.innerHTML = matching.map((entry) => `
    <article class="news-item">
      <time class="news-date" datetime="${escapeHtml(entry.date)}">${formatDate(entry.date)}</time>
      <span class="news-category">${escapeHtml(entry.category)}</span>
      <div class="news-summary"><div class="news-title">${escapeHtml(entry.title)}</div><div class="news-description">${escapeHtml(entry.description)}</div></div>
      <span class="news-read">Notice <span aria-hidden="true">↗</span></span>
    </article>`).join("");
  emptyNews.style.display = matching.length ? "none" : "block";
  emptyNews.textContent = query ? "No updates match that search." : "No college announcements have been published yet.";
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function formatDate(value) {
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? "Draft" : new Intl.DateTimeFormat("en", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function openModal(content, title = "AKMMIAC") {
  previousFocus = document.activeElement;
  modalContent.innerHTML = content;
  modalContent.setAttribute("data-title", title);
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  modalBackdrop.querySelector(".modal-close").focus();
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  if (previousFocus && typeof previousFocus.focus === "function") previousFocus.focus();
}

function openStudentPortal() {
  window.open("https://ims.snec.in/student/login", "_blank", "noopener,noreferrer");
}

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const nav = document.querySelector("#primary-nav");
  const isOpen = button.getAttribute("aria-expanded") === "true";
  button.setAttribute("aria-expanded", String(!isOpen));
  button.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  nav.classList.toggle("open", !isOpen);
});

document.querySelectorAll("#primary-nav a").forEach((link) => link.addEventListener("click", () => {
  document.querySelector("#primary-nav").classList.remove("open");
  document.querySelector(".menu-toggle").setAttribute("aria-expanded", "false");
}));

document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-open]");
  if (!trigger) return;
  if (trigger.dataset.open === "student") openStudentPortal();
  if (trigger.dataset.open === "contact") {
    openModal(`<p class="modal-kicker">CONTACT THE COLLEGE</p><h2 id="modal-title">Send a message.</h2><p class="modal-lead">This demonstration form stores no information remotely. For a live enquiry, please call the college directly.</p><form class="contact-form" id="contact-form"><label>Your name<input name="name" required maxlength="80"></label><label>Phone or email<input name="replyTo" required maxlength="100"></label><label>Message<textarea name="message" required maxlength="500"></textarea></label><button class="button button-green" type="submit">Send demo message <span>↗</span></button></form>`, "Contact form");
    document.querySelector("#contact-form").addEventListener("submit", (submitEvent) => { submitEvent.preventDefault(); closeModal(); announce("Demo message noted. Please call the college for a live enquiry."); });
  }
});

document.querySelector(".modal-close").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => { if (event.target === modalBackdrop) closeModal(); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !modalBackdrop.hidden) closeModal(); });

document.querySelector("#admission-form").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const values = Object.fromEntries(new FormData(event.currentTarget));
  delete values.on;
  const enquiries = readStorage(STORAGE.enquiries);
  enquiries.push({ ...values, createdAt: new Date().toISOString() });
  localStorage.setItem(STORAGE.enquiries, JSON.stringify(enquiries));
  event.currentTarget.reset();
  document.querySelector("#admission-status").textContent = "Demo enquiry saved on this browser only. To contact the college, call one of the numbers listed.";
  announce("Enquiry saved locally in this browser.");
});

document.querySelector("#news-search").addEventListener("input", (event) => renderNews(event.currentTarget.value));

document.querySelectorAll(".filter-button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-button").forEach((item) => item.classList.toggle("active", item === button));
  document.querySelectorAll(".gallery-item").forEach((item) => item.classList.toggle("filtered-out", button.dataset.filter !== "all" && item.dataset.category !== button.dataset.filter));
}));

document.querySelectorAll(".gallery-item").forEach((item) => item.addEventListener("click", () => {
  const image = item.querySelector(".gallery-image");
  const background = getComputedStyle(image).backgroundImage;
  openModal(`<p class="modal-kicker">DEMONSTRATION GALLERY</p><div class="lightbox-image" style="background-image:${background}"></div><p class="lightbox-caption" id="modal-title">${escapeHtml(item.dataset.title)}</p><p class="form-status">Replace this image and caption with college-approved material.</p>`, "Gallery image");
}));

renderNews();