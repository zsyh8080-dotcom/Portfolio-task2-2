function initializePointerAndScroll() {
  const documentRoot = document.documentElement;
  const finePointer = matchMedia("(hover:hover) and (pointer:fine)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const scrollControl = document.querySelector(".page-scroll-control");
  const scrollThumb = scrollControl?.querySelector(".page-scroll-thumb");
  let scheduledScrollFrame = 0, dragState = null;
  function updateScrollIndicator() {
    scheduledScrollFrame = 0;
    if (!scrollControl || !scrollThumb) return;
    const maximumScroll = Math.max(0, documentRoot.scrollHeight - window.innerHeight), trackHeight = scrollControl.clientHeight;
    const thumbHeight = Math.min(trackHeight, Math.max(52, Math.min(88, trackHeight * window.innerHeight / documentRoot.scrollHeight)));
    const scrollProgress = maximumScroll ? Math.max(0, Math.min(1, window.scrollY / maximumScroll)) : 0;
    scrollThumb.style.height = `${thumbHeight}px`;
    scrollThumb.style.transform = `translateY(${scrollProgress * (trackHeight - thumbHeight)}px)`;
    scrollControl.setAttribute("aria-valuenow", String(Math.round(scrollProgress * 100)));
    documentRoot.classList.toggle("hud-scroll-ready", finePointer.matches && maximumScroll > 0);
  }
  function scheduleScrollUpdate() {
    if (!scheduledScrollFrame) scheduledScrollFrame = requestAnimationFrame(updateScrollIndicator);
  }
  function scrollToPointerPosition(verticalPosition, grabOffset) {
    const bounds = scrollControl.getBoundingClientRect();
    const available = bounds.height - scrollThumb.offsetHeight;
    const scrollFraction = Math.max(0, Math.min(1, (verticalPosition - bounds.top - grabOffset) / Math.max(1, available)));
    window.scrollTo({ top: scrollFraction * (documentRoot.scrollHeight - window.innerHeight), behavior: "instant" });
  }
  scrollControl?.addEventListener("pointerdown", (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    const bounds = scrollThumb.getBoundingClientRect();
    dragState = { offset: event.target === scrollThumb ? event.clientY - bounds.top : bounds.height / 2 };
    scrollControl.setPointerCapture(event.pointerId);
    scrollControl.classList.add("is-dragging");
    scrollControl.focus({ preventScroll: true });
    scrollToPointerPosition(event.clientY, dragState.offset);
  });
  scrollControl?.addEventListener("pointermove", (event) => {
    if (dragState) scrollToPointerPosition(event.clientY, dragState.offset);
  });
  const finishScrollDrag = () => {
    dragState = null;
    scrollControl?.classList.remove("is-dragging");
  };
  scrollControl?.addEventListener("pointerup", finishScrollDrag);
  scrollControl?.addEventListener("pointercancel", finishScrollDrag);
  scrollControl?.addEventListener("lostpointercapture", finishScrollDrag);
  scrollControl?.addEventListener("keydown", (event) => {
    let verticalPosition = window.scrollY;
    switch (event.key) {
      case "ArrowDown":
        verticalPosition += 48;
        break;
      case "ArrowUp":
        verticalPosition -= 48;
        break;
      case "PageDown":
        verticalPosition += window.innerHeight * 0.8;
        break;
      case "PageUp":
        verticalPosition -= window.innerHeight * 0.8;
        break;
      case "Home":
        verticalPosition = 0;
        break;
      case "End":
        verticalPosition = documentRoot.scrollHeight;
        break;
      default:
        return;
    }
    event.preventDefault();
    window.scrollTo({ top: verticalPosition, behavior: "instant" });
  });
  window.addEventListener("scroll", scheduleScrollUpdate, { passive: true });
  window.addEventListener("resize", scheduleScrollUpdate, { passive: true });
  new ResizeObserver(scheduleScrollUpdate).observe(document.body);
  finePointer.addEventListener("change", scheduleScrollUpdate);
  updateScrollIndicator();
  const profileNavigation = document.querySelector("#profile-navigation");
  profileNavigation?.addEventListener("focusin", (event) => {
    const focusedLink = event.target.closest("a");
    if (focusedLink) focusedLink.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  });
  const cursor = document.createElement("div");
  cursor.className = "neural-cursor";
  cursor.setAttribute("aria-hidden", "true");
  cursor.innerHTML = '<svg viewBox="0 0 30 36" fill="none"><path d="M1 1 5 28 12 20 19 34 24 31 17 18 27 17Z" fill="#061c20" stroke="#55ffd6" stroke-width="1.2" stroke-linejoin="round"/><path d="m5 7 2 14m1-14 13 9" stroke="#55ffd6" stroke-width=".5" opacity=".55"/><path d="m10 12 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z" fill="#b0ffec"/></svg>';
  document.body.append(cursor);
  let previousPointerX = 0, previousPointerY = 0, lastTrailTime = 0, activeParticleCount = 0;
  const isMotionPaused = () => reducedMotion.matches || documentRoot.classList.contains("motion-paused");
  const hideCursor = () => {
    documentRoot.classList.remove("neural-cursor-ready");
    cursor.classList.remove("is-visible");
  };
  function animateTemporaryParticle(className, horizontalPosition, verticalPosition, keyframes, animationOptions) {
    const item = document.createElement("i");
    item.className = className;
    item.style.left = `${horizontalPosition}px`;
    item.style.top = `${verticalPosition}px`;
    document.body.append(item);
    activeParticleCount++;
    const animation = item.animate(keyframes, animationOptions);
    const cleanup = () => {
      item.remove();
      activeParticleCount--;
    };
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
  }
  document.addEventListener("pointermove", (event) => {
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") {
      hideCursor();
      return;
    }
    const target = event.target instanceof Element ? event.target : null;
    if (target?.closest("input,textarea,[contenteditable=true]")) {
      hideCursor();
      return;
    }
    cursor.style.transform = `translate3d(${event.clientX - 1}px,${event.clientY - 1}px,0)`;
    cursor.classList.add("is-visible");
    documentRoot.classList.add("neural-cursor-ready");
    cursor.classList.toggle("is-hover", !!target?.closest("a,button,[role=button],.project-card,[role=scrollbar],#neural-canvas"));
    const currentTime = performance.now();
    if (!isMotionPaused() && currentTime - lastTrailTime > 32 && activeParticleCount < 7 && Math.hypot(event.clientX - previousPointerX, event.clientY - previousPointerY) > 7) {
      lastTrailTime = currentTime;
      animateTemporaryParticle("cursor-particle", event.clientX + 4, event.clientY + 9, [{ opacity: 0.5, transform: "translate(0,0) scale(1)" }, { opacity: 0, transform: "translate(3px,7px) scale(.3)" }], { duration: 230, easing: "ease-out" });
    }
    previousPointerX = event.clientX;
    previousPointerY = event.clientY;
  }, { passive: true });
  document.addEventListener("pointerdown", (event) => {
    if (finePointer.matches && !isMotionPaused() && event.pointerType !== "touch" && activeParticleCount < 10) animateTemporaryParticle("cursor-pulse", event.clientX - 4, event.clientY - 4, [{ opacity: 0.65, transform: "scale(.6)" }, { opacity: 0, transform: "scale(3.5)" }], { duration: 330, easing: "ease-out" });
  }, { passive: true });
  document.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) hideCursor();
  });
  window.addEventListener("blur", hideCursor);
  document.addEventListener("keydown", hideCursor);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) hideCursor();
  });
  finePointer.addEventListener("change", hideCursor);
  reducedMotion.addEventListener("change", hideCursor);
}
export {
  initializePointerAndScroll
};
