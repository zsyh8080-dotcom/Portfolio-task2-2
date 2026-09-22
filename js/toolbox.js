import { translate } from "./i18n.js";
function initializeToolbox() {
  document.querySelectorAll("[data-skill-filter]").forEach((filterButton) => filterButton.addEventListener("click", () => {
    document.querySelectorAll("[data-skill-filter]").forEach((button) => {
      button.classList.toggle("active", button === filterButton);
      button.setAttribute("aria-pressed", String(button === filterButton));
    });
    document.querySelectorAll("[data-skill-category]").forEach((skillCard, index) => {
      skillCard.hidden = filterButton.dataset.skillFilter !== "all" && skillCard.dataset.skillCategory !== filterButton.dataset.skillFilter;
      skillCard.classList.remove("entering");
      if (!skillCard.hidden) {
        skillCard.style.animationDelay = Math.min(index * 0.015, 0.12) + "s";
        requestAnimationFrame(() => skillCard.classList.add("entering"));
      }
    });
  }));
  const motionButton = document.querySelector("#motion-toggle");
  motionButton?.addEventListener("click", () => {
    const isPaused = document.documentElement.classList.toggle("motion-paused");
    motionButton.setAttribute("aria-pressed", String(isPaused));
    motionButton.textContent = isPaused ? "▶" : "Ⅱ";
    motionButton.setAttribute("aria-label", isPaused ? translate("Resume animations", "ادامهٔ حرکت") : translate("Pause animations", "توقف حرکت"));
    document.dispatchEvent(new Event("motionchange"));
  });
  const certificateDialog = document.querySelector("#certificate-modal");
  if (certificateDialog) {
    let certificateButton;
    document.querySelectorAll("[data-certificate-image]").forEach((button) => button.addEventListener("click", () => {
      certificateButton = button;
      const title = translate(button.dataset.titleEn, button.dataset.titleFa);
      certificateDialog.querySelector("img").src = button.dataset.certificateImage;
      certificateDialog.querySelector("img").alt = title;
      certificateDialog.querySelector("h2").textContent = title;
      certificateDialog.querySelector("a").href = button.dataset.original;
      certificateDialog.showModal();
    }));
    certificateDialog.querySelector("button").addEventListener("click", () => certificateDialog.close());
    certificateDialog.addEventListener("click", (event) => {
      if (event.target === certificateDialog) {
        const dialogBounds = certificateDialog.getBoundingClientRect();
        if (event.clientX < dialogBounds.left || event.clientX > dialogBounds.right || event.clientY < dialogBounds.top || event.clientY > dialogBounds.bottom) certificateDialog.close();
      }
    });
    certificateDialog.addEventListener("close", () => certificateButton?.focus());
  }
}
export {
  initializeToolbox
};
