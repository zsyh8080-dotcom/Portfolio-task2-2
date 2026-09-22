function initializeScrollReveal() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  }), { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => {
    element.classList.add("ready");
    revealObserver.observe(element);
  });
}
export {
  initializeScrollReveal
};
