const pointerCursor = document.querySelector("#pointer-cursor");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const highlightSelector = [
  ".academic-panel",
  ".academic-footnote",
  ".campus-card",
  ".facts-grid",
  ".facts-grid > *",
  ".value-item",
  ".about-visual",
  ".news-item",
  ".empty-news",
  ".gallery-item",
  ".achievement-empty",
  ".people-counts > div",
  ".staff-profile",
  ".resource-empty",
  ".resource-list > div",
  ".admission-caveat",
  ".enquiry-form",
  ".contact-aside",
  ".stat-card",
  ".panel-card",
  ".access-box",
  ".activity-row",
  ".notice-row",
  ".readiness-list li",
  ".staff-admin-list article",
  ".admin-entry",
  ".editor-form",
  ".module-table",
  ".empty-module",
  ".settings-card",
  ".setting-row",
  ".profile-button",
  ".quick-grid button",
  ".academic-admin-card",
].join(", ");

function getHighlightTargets(element) {
  const targets = [];

  for (let current = element; current && current !== document.body; current = current.parentElement) {
    if (current.matches(highlightSelector)) targets.push(current);
  }

  return targets;
}

if (pointerCursor && finePointer.matches && !reducedMotion.matches) {
  document.body.classList.add("has-custom-pointer");

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    pointerCursor.style.setProperty("--pointer-x", `${event.clientX}px`);
    pointerCursor.style.setProperty("--pointer-y", `${event.clientY}px`);
    pointerCursor.classList.add("is-visible");

    const target = event.target instanceof Element ? event.target.closest(highlightSelector) : null;
    if (target) {
      const bounds = target.getBoundingClientRect();
      target.style.setProperty("--highlight-x", `${event.clientX - bounds.left}px`);
      target.style.setProperty("--highlight-y", `${event.clientY - bounds.top}px`);
    }
  }, { passive: true });

  document.addEventListener("pointerover", (event) => {
    if (!(event.target instanceof Element)) return;
    getHighlightTargets(event.target).forEach((target) => target.classList.add("pointer-highlight"));
  }, { passive: true });

  document.addEventListener("pointerout", (event) => {
    if (!(event.target instanceof Element)) return;
    const currentTargets = getHighlightTargets(event.target);
    const nextTargets = event.relatedTarget instanceof Element ? new Set(getHighlightTargets(event.relatedTarget)) : new Set();
    currentTargets.forEach((target) => {
      if (!nextTargets.has(target)) target.classList.remove("pointer-highlight");
    });
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    pointerCursor.classList.remove("is-visible");
    document.querySelectorAll(".pointer-highlight").forEach((target) => target.classList.remove("pointer-highlight"));
  });
  window.addEventListener("blur", () => pointerCursor.classList.remove("is-visible"));
}
