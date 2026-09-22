import { getSphereLayout } from "./sphere-layout.js";

export function initializeMatrixRain() {
  const matrixCanvas = document.querySelector("#matrix-canvas");
  if (!matrixCanvas) return;
  const context = matrixCanvas.getContext("2d");
  if (!context) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const characters = "01アイΣλ";
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let previousFrameTime = 0;
  let isVisible = true;
  let rainColumns = [];

  function drawRain(deltaTime = 0) {
    const isLightTheme = document.documentElement.dataset.theme === "light";
    const characterColor = isLightTheme ? "8,115,91" : "66,242,196";
    context.clearRect(0, 0, width, height);
    const { centerX, centerY, radius } = getSphereLayout(width, height);
    context.save();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.moveTo(centerX + radius * 1.012, centerY);
    context.arc(centerX, centerY, radius * 1.012, 0, Math.PI * 2);
    context.clip("evenodd");
    context.font = "11px monospace";
    rainColumns.forEach((column, columnIndex) => {
      for (let characterIndex = 0; characterIndex < column.tailLength; characterIndex++) {
        const opacity = (1 - characterIndex / column.tailLength) * (isLightTheme ? 0.4 : 0.52);
        const glyphIndex = (columnIndex * 3 + characterIndex + Math.floor(column.phase)) % characters.length;
        context.fillStyle = `rgba(${characterColor},${opacity})`;
        context.fillText(characters[glyphIndex], column.x, column.y - characterIndex * 14);
      }
      column.y += deltaTime * column.speed;
      if (column.y > height + column.tailLength * 14) {
        column.y = -15;
        column.phase++;
      }
    });
    context.restore();
  }

  function isAnimationPaused() {
    return !isVisible || document.hidden || reducedMotion.matches || document.documentElement.classList.contains("motion-paused");
  }

  function animateRain(currentTime) {
    animationFrame = 0;
    if (isAnimationPaused()) return;
    const deltaTime = previousFrameTime ? Math.min(80, currentTime - previousFrameTime) : 0;
    if (deltaTime < 45 && previousFrameTime) {
      animationFrame = requestAnimationFrame(animateRain);
      return;
    }
    previousFrameTime = currentTime;
    drawRain(deltaTime);
    animationFrame = requestAnimationFrame(animateRain);
  }

  function synchronizeAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
    drawRain();
    if (!isAnimationPaused()) animationFrame = requestAnimationFrame(animateRain);
  }

  function resizeCanvas() {
    const bounds = matrixCanvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    const pixelRatio = Math.min(devicePixelRatio || 1, 1.5);
    matrixCanvas.width = Math.round(width * pixelRatio);
    matrixCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    rainColumns = Array.from({ length: Math.ceil(width / 14) }, (_, columnIndex) => ({
      x: columnIndex * 14 + 4,
      y: (columnIndex * 137.3) % (height + 100),
      speed: 0.027 + (columnIndex % 5) * 0.005,
      tailLength: 8 + columnIndex % 8,
      phase: columnIndex
    }));
    synchronizeAnimation();
  }

  new ResizeObserver(resizeCanvas).observe(matrixCanvas);
  new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    synchronizeAnimation();
  }).observe(matrixCanvas);
  document.addEventListener("visibilitychange", synchronizeAnimation);
  document.addEventListener("motionchange", synchronizeAnimation);
  document.addEventListener("themechange", synchronizeAnimation);
  reducedMotion.addEventListener("change", synchronizeAnimation);
  resizeCanvas();
}
