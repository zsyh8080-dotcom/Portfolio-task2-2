function initializePageAnimations() {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  if (!reducedMotion.matches && window.gsap) {
    document.documentElement.classList.add("gsap-active");
    const entranceAnimation = gsap.fromTo(".hero-step", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 1.1, stagger: 0.055, ease: "power3.out", clearProps: "all" });
    reducedMotion.addEventListener("change", () => {
      if (reducedMotion.matches) {
        entranceAnimation.progress(1);
        gsap.set(".hero-step", { clearProps: "all" });
      }
    });
  }
  const timeline = document.querySelector(".timeline"), progressLine = document.querySelector("#timeline-progress-line");
  let isUpdateScheduled = false;
  function updateTimelineProgress() {
    isUpdateScheduled = false;
    if (!progressLine) return;
    const timelineBounds = timeline.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight * 0.72 - timelineBounds.top) / timelineBounds.height));
    progressLine.style.height = (reducedMotion.matches ? 100 : progress * 100) + "%";
    timeline.querySelectorAll(".timeline-item").forEach((item) => item.classList.toggle("in-view", item.getBoundingClientRect().top < innerHeight * 0.72));
  }
  function scheduleTimelineUpdate() {
    if (!isUpdateScheduled) {
      isUpdateScheduled = true;
      requestAnimationFrame(updateTimelineProgress);
    }
  }
  if (timeline && progressLine) {
    window.addEventListener("scroll", scheduleTimelineUpdate, { passive: true });
    window.addEventListener("resize", scheduleTimelineUpdate);
    reducedMotion.addEventListener("change", scheduleTimelineUpdate);
    scheduleTimelineUpdate();
  }
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    document.querySelectorAll(".spotlight-card,.focus-card,.project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        if (reducedMotion.matches) return;
        const cardBounds = card.getBoundingClientRect();
        card.style.setProperty("--px", event.clientX - cardBounds.left + "px");
        card.style.setProperty("--py", event.clientY - cardBounds.top + "px");
      });
    });
  }
}
export {
  initializePageAnimations
};
