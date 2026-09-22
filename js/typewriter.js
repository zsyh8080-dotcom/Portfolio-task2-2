import { translate } from "./i18n.js";
function initializeTypewriter() {
  let typewriter;
  const roleElement = document.querySelector("#typed-role");
  if (!roleElement) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  function synchronizePlayback() {
    if (document.hidden || document.documentElement.classList.contains("motion-paused")) typewriter?.stop();
    else typewriter?.start();
  }
  function startTypewriter() {
    typewriter?.destroy();
    typewriter = null;
    const roles = translate(["Python Developer", "Computer Vision Researcher", "Data Engineer"], ["برنامه‌نویس پایتون", "پژوهشگر بینایی ماشین", "مهندس داده"]);
    roleElement.textContent = roles[0];
    if (!reducedMotion.matches && window.Typed) {
      roleElement.textContent = "";
      typewriter = new window.Typed(roleElement, { strings: roles, typeSpeed: 55, backSpeed: 28, backDelay: 1600, loop: true, smartBackspace: true });
      synchronizePlayback();
    }
  }
  startTypewriter();
  document.addEventListener("languagechange", startTypewriter);
  document.addEventListener("motionchange", synchronizePlayback);
  document.addEventListener("visibilitychange", synchronizePlayback);
  reducedMotion.addEventListener("change", startTypewriter);
}
export {
  initializeTypewriter
};
