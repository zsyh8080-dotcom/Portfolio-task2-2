function initializeCardEffects() {
  if (window.CSS?.registerProperty) document.documentElement.classList.add("fx-properties");
  const cards = document.querySelectorAll(".fx-border");
  const cardObserver = new IntersectionObserver((entries) => entries.forEach((entry) => entry.target.classList.toggle("fx-visible", entry.isIntersecting)), { rootMargin: "30px" });
  cards.forEach((card) => cardObserver.observe(card));
  const updatePageVisibility = () => document.documentElement.classList.toggle("fx-page-hidden", document.hidden);
  document.addEventListener("visibilitychange", updatePageVisibility);
  updatePageVisibility();
}
export {
  initializeCardEffects
};
