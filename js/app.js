import { initializePointerAndScroll } from "./ai-console.js";
import { initializeCardEffects } from "./effects.js";
import { initializeMatrixRain } from "./matrix-rain.js";
import { initializeToolbox } from "./toolbox.js";
import { initializeTheme } from "./theme.js";
import { initializeLanguage } from "./i18n.js";
import { initializeTypewriter } from "./typewriter.js";
import { initializeNeuralNetwork } from "./neural-canvas.js";
import { initializePageAnimations } from "./animations.js";
import { initializeScrollReveal } from "./scroll-reveal.js";
import { initializeArchitectureDiagram } from "./architecture-animation.js";
import { initializeSearch } from "./command-palette.js";
import { initializeProjectFilters } from "./projects.js";
initializeTheme();
await initializeLanguage();
initializeTypewriter();
initializeNeuralNetwork();
initializePageAnimations();
initializeScrollReveal();
initializeArchitectureDiagram();
initializeSearch();
initializeProjectFilters();
initializeToolbox();
initializeCardEffects();
initializeMatrixRain();
initializePointerAndScroll();
const menuButton = document.querySelector("#nav-toggle");
const headerLinks = document.querySelector("#nav-links");
const closeHeaderMenu = () => {
  headerLinks?.classList.remove("open");
  menuButton?.setAttribute("aria-expanded", "false");
};
menuButton?.addEventListener("click", () => {
  const isOpen = headerLinks.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});
headerLinks?.querySelectorAll("a").forEach((navigationLink) => navigationLink.addEventListener("click", closeHeaderMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && headerLinks?.classList.contains("open")) {
    closeHeaderMenu();
    menuButton.focus();
  }
});
document.addEventListener("pointerdown", (event) => {
  if (headerLinks?.classList.contains("open") && !event.target.closest(".site-header")) closeHeaderMenu();
});
const sectionObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const sectionName = { home: "about", focus: "about", architecture: "research", forensics: "research" }[entry.target.id] || entry.target.id;
    if (!document.querySelector(`[data-section="${sectionName}"]`)) continue;
    document.querySelectorAll("[data-section]").forEach((navigationLink) => {
      const isActive = navigationLink.dataset.section === sectionName;
      navigationLink.classList.toggle("active", isActive);
      if (isActive) navigationLink.setAttribute("aria-current", "location");
      else navigationLink.removeAttribute("aria-current");
    });
  }
}, { rootMargin: "-20% 0px -65% 0px" });
document.querySelectorAll("main section[id]").forEach((sectionElement) => sectionObserver.observe(sectionElement));
const backToTopButton = document.querySelector("#back-to-top");
if (backToTopButton) {
  const updateBackToTopButton = () => {
    backToTopButton.hidden = window.scrollY < 300;
    document.documentElement.classList.toggle("is-scrolling", window.scrollY > 40);
  };
  window.addEventListener("scroll", updateBackToTopButton, { passive: true });
  updateBackToTopButton();
  backToTopButton.addEventListener("click", () => window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }));
}
