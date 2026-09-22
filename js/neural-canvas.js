import { getSphereLayout } from "./sphere-layout.js";

function initializeNeuralNetwork() {
  const networkCanvas = document.querySelector("#neural-canvas");
  if (!networkCanvas) return;
  const context = networkCanvas.getContext("2d");
  if (!context) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const keyNodeDefinitions = [{ label: "RAG", x: -0.82, y: 0.08, z: 0.51 }, { label: "LLM", x: -0.12, y: -0.86, z: 0.45 }, { label: "Computer Vision", x: 0.76, y: -0.25, z: 0.58 }, { label: "Data", x: -0.64, y: 0.49, z: 0.58 }, { label: "ML", x: 0.68, y: 0.49, z: 0.46 }, { label: "NLP", x: 0.04, y: 0.93, z: 0.32 }];
  let width = 0, height = 0, animationFrame = 0, isVisible = true, elapsedTime = 0, previousFrameTime = 0, rotationY = -0.28, rotationX = 0.18, pointerTilt = 0, hoveredNodeIndex = -1, spherePoints = [], connectionPairs = [], resizeTimeout;
  let isLightTheme = false;
  function projectPoint(point) {
    const x = point.x * Math.cos(rotationY) - point.z * Math.sin(rotationY);
    let z = point.x * Math.sin(rotationY) + point.z * Math.cos(rotationY);
    const y = point.y * Math.cos(rotationX) - z * Math.sin(rotationX);
    z = point.y * Math.sin(rotationX) + z * Math.cos(rotationX);
    const perspectiveScale = 1 + z * 0.09;
    const { centerX, centerY, radius } = getSphereLayout(width, height);
    return { x: centerX + x * radius * perspectiveScale, y: centerY + y * radius * perspectiveScale, z };
  }
  function createSphereGeometry() {
    const pointCount = width < 400 ? 115 : 165;
    spherePoints = Array.from({ length: pointCount }, (_, index) => {
      const y = 1 - 2 * (index + 0.5) / pointCount, radius = Math.sqrt(1 - y * y), angle = index * Math.PI * (3 - Math.sqrt(5));
      return { x: Math.cos(angle) * radius, y, z: Math.sin(angle) * radius };
    });
    connectionPairs = [];
    spherePoints.forEach((point, index) => {
      for (let neighborIndex = index + 1; neighborIndex < spherePoints.length; neighborIndex++) {
        const nextPoint = spherePoints[neighborIndex];
        const nodeDistance = Math.hypot(point.x - nextPoint.x, point.y - nextPoint.y, point.z - nextPoint.z);
        if (nodeDistance < 0.4) connectionPairs.push([index, neighborIndex]);
      }
    });
  }
  function drawGlow(x, y, radius, color, alpha = 1) {
    context.globalAlpha = alpha;
    const glowGradient = context.createRadialGradient(x, y, 0, x, y, radius);
    glowGradient.addColorStop(0, color);
    glowGradient.addColorStop(0.17, color);
    glowGradient.addColorStop(1, "transparent");
    context.fillStyle = glowGradient;
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    context.globalAlpha = 1;
  }
  function drawConnection(curvePoints, color, strokeWidth = 0.6) {
    context.strokeStyle = color;
    context.lineWidth = strokeWidth;
    context.beginPath();
    curvePoints.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.stroke();
  }
  function drawNetwork() {
    if (!width) return;
    context.clearRect(0, 0, width, height);
    const { centerX, centerY, radius } = getSphereLayout(width, height);
    const sphereSurface = context.createRadialGradient(centerX - radius * 0.24, centerY - radius * 0.32, radius * 0.1, centerX, centerY, radius);
    sphereSurface.addColorStop(0, isLightTheme ? "#edf8f5" : "#091c22");
    sphereSurface.addColorStop(1, isLightTheme ? "#f4f8fb" : "#050d13");
    context.fillStyle = sphereSurface;
    context.beginPath();
    context.arc(centerX, centerY, radius * 1.012, 0, Math.PI * 2);
    context.fill();
    const fog = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.35);
    fog.addColorStop(0, isLightTheme ? "#0a837c08" : "#14d6b511");
    fog.addColorStop(0.75, isLightTheme ? "#0a837c05" : "#0c9bac08");
    fog.addColorStop(1, "transparent");
    context.fillStyle = fog;
    context.fillRect(0, 0, width, height);
    const connectionColor = isLightTheme ? "12,125,116" : "45,220,192";
    for (let latitudeDegrees = -60; latitudeDegrees <= 60; latitudeDegrees += 20) {
      const latitudeRadians = latitudeDegrees * Math.PI / 180, curvePoints = [];
      for (let neighborIndex = 0; neighborIndex <= 90; neighborIndex++) {
        const angle = neighborIndex / 90 * Math.PI * 2;
        curvePoints.push(projectPoint({ x: Math.cos(angle) * Math.cos(latitudeRadians), y: Math.sin(latitudeRadians), z: Math.sin(angle) * Math.cos(latitudeRadians) }));
      }
      drawConnection(curvePoints, `rgba(${connectionColor},.09)`);
    }
    for (let longitudeDegrees = 0; longitudeDegrees < 180; longitudeDegrees += 20) {
      const angle = longitudeDegrees * Math.PI / 180, curvePoints = [];
      for (let neighborIndex = 0; neighborIndex <= 90; neighborIndex++) {
        const latitudeAngle = neighborIndex / 90 * Math.PI * 2;
        curvePoints.push(projectPoint({ x: Math.cos(latitudeAngle) * Math.cos(angle), y: Math.sin(latitudeAngle), z: Math.cos(latitudeAngle) * Math.sin(angle) }));
      }
      drawConnection(curvePoints, `rgba(${connectionColor},.10)`);
    }
    context.save();
    context.translate(centerX, centerY);
    context.rotate(-0.28);
    for (let index = 0; index < 2; index++) {
      context.strokeStyle = index ? (isLightTheme ? "rgba(8,108,140,.28)" : "rgba(56,217,255,.18)") : `rgba(${connectionColor},.34)`;
      context.lineWidth = 0.65;
      context.setLineDash(index ? [2, 9] : [20, 5, 2, 12]);
      context.beginPath();
      context.ellipse(0, 0, radius * (1.22 + index * 0.07), radius * (0.38 + index * 0.29), index * 0.78, 0, Math.PI * 2);
      context.stroke();
    }
    context.restore();
    context.setLineDash([]);
    const projectedPoints = spherePoints.map(projectPoint);
    connectionPairs.forEach(([index, neighborIndex], connectionIndex) => {
      const point = projectedPoints[index], nextPoint = projectedPoints[neighborIndex], depth = (point.z + nextPoint.z + 2) / 4;
      const violetColor = isLightTheme ? "105,67,174" : "157,135,255";
      drawConnection([point, nextPoint], connectionIndex % 17 === 0 ? `rgba(${violetColor},${0.05 + depth * 0.28})` : `rgba(${connectionColor},${0.035 + depth * 0.25})`, 0.45 + depth * 0.45);
      if (connectionIndex % 17 === 0) {
        const travelProgress = (elapsedTime * 22e-5 + connectionIndex * 0.123) % 1, x = point.x + (nextPoint.x - point.x) * travelProgress, y = point.y + (nextPoint.y - point.y) * travelProgress;
        const particleColor = isLightTheme ? (connectionIndex % 2 ? "#08735b" : "#086c8c") : (connectionIndex % 2 ? "#55ffd6" : "#65dfff");
        drawGlow(x, y, 4, particleColor, 0.3 + depth * 0.5);
        context.fillStyle = isLightTheme ? "#08735b" : "#a9ffed";
        context.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
      }
    });
    projectedPoints.forEach((point, index) => {
      const depth = (point.z + 1) / 2;
      context.fillStyle = index % 14 === 0 ? isLightTheme ? "#8263bf" : "#bbadff" : index % 5 === 0 ? isLightTheme ? "#058ea7" : "#45d9ff" : isLightTheme ? "#07947c" : "#55ffd6";
      context.globalAlpha = 0.15 + depth * 0.75;
      context.beginPath();
      context.arc(point.x, point.y, 0.7 + depth * 1.15, 0, Math.PI * 2);
      context.fill();
      if (depth > 0.8 && index % 4 === 0) drawGlow(point.x, point.y, 7, context.fillStyle, 0.35);
      context.globalAlpha = 1;
    });
    const keyNodes = keyNodeDefinitions.map((nodeDefinition, index) => ({ ...nodeDefinition, ...projectPoint(nodeDefinition), i: index }));
    keyNodes.forEach((nodeDefinition, index) => {
      const nextPoint = keyNodes[(index + 2) % keyNodes.length];
      const keyConnectionColor = isLightTheme ? (index % 2 ? "#086c8c70" : "#08735b70") : (index % 2 ? "#38d9ff44" : "#55ffd645");
      drawConnection([nodeDefinition, nextPoint], keyConnectionColor, 0.8);
      const nodeColor = index === 1 || index === 4 ? isLightTheme ? "#8570c7" : "#b8a3ff" : index % 3 === 0 ? isLightTheme ? "#009c85" : "#55ffd6" : isLightTheme ? "#0392b1" : "#57dcff";
      drawGlow(nodeDefinition.x, nodeDefinition.y, hoveredNodeIndex === index ? 23 : 18, nodeColor, isLightTheme ? 0.25 : 0.62);
      context.shadowColor = nodeColor;
      context.shadowBlur = 9;
      context.fillStyle = isLightTheme ? nodeColor : "#b7fff2";
      context.beginPath();
      context.arc(nodeDefinition.x, nodeDefinition.y, hoveredNodeIndex === index ? 4.6 : 3.8, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
      if (hoveredNodeIndex === index) {
        context.strokeStyle = nodeColor;
        context.lineWidth = 0.8;
        context.beginPath();
        context.arc(nodeDefinition.x, nodeDefinition.y, 10, 0, Math.PI * 2);
        context.stroke();
      }
    });
    for (let index = 0; index < 4; index++) {
      const angle = elapsedTime * 45e-6 + index * 1.63;
      const x = centerX + Math.cos(angle) * radius * 1.19, y = centerY + Math.sin(angle) * radius * 0.76;
      context.strokeStyle = isLightTheme ? "#086c8c55" : "#38d9ff25";
      context.beginPath();
      context.arc(x, y, 9, 0, Math.PI * 2);
      context.stroke();
      drawGlow(x, y, 5, isLightTheme ? "#086c8c" : "#38d9ff", 0.38);
      context.fillStyle = isLightTheme ? "#086c8c" : "#71e4f0";
      context.beginPath();
      context.arc(x, y, 2.1, 0, Math.PI * 2);
      context.fill();
    }
  }
  function isAnimationPaused() {
    return reducedMotion.matches || document.hidden || !isVisible || document.documentElement.classList.contains("motion-paused");
  }
  function animateNetwork(currentTime) {
    animationFrame = 0;
    if (isAnimationPaused()) return;
    if (previousFrameTime && currentTime - previousFrameTime < 32) {
      resumeAnimation();
      return;
    }
    const deltaTime = previousFrameTime ? Math.min(64, currentTime - previousFrameTime) : 32;
    previousFrameTime = currentTime;
    elapsedTime += deltaTime;
    rotationY += deltaTime * 35e-6;
    rotationX += (0.18 + pointerTilt - rotationX) * 0.06;
    drawNetwork();
    if (hoveredNodeIndex >= 0) showNodeLabel(hoveredNodeIndex);
    resumeAnimation();
  }
  function resumeAnimation() {
    if (!isAnimationPaused() && !animationFrame) animationFrame = requestAnimationFrame(animateNetwork);
  }
  function synchronizeAnimation() {
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
    drawNetwork();
    resumeAnimation();
  }
  function resizeCanvas() {
    const bounds = networkCanvas.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    if (!width || !height) return;
    const pixelRatio = Math.min(devicePixelRatio || 1, 2);
    networkCanvas.width = Math.round(width * pixelRatio);
    networkCanvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    createSphereGeometry();
    synchronizeAnimation();
  }
  function showNodeLabel(index) {
    const tooltip = document.querySelector("#neural-tooltip");
    if (!tooltip) return;
    if (index < 0) {
      tooltip.hidden = true;
      return;
    }
    tooltip.textContent = keyNodeDefinitions[index].label;
    tooltip.hidden = false;
    const point = projectPoint(keyNodeDefinitions[index]);
    tooltip.style.left = `${Math.max(7, Math.min(point.x - 30, width - 130))}px`;
    tooltip.style.top = `${Math.max(7, point.y - 39)}px`;
  }
  networkCanvas.addEventListener("pointermove", (event) => {
    const bounds = networkCanvas.getBoundingClientRect(), x = event.clientX - bounds.left, y = event.clientY - bounds.top;
    pointerTilt = (y / height - 0.5) * 0.16;
    let closestNodeIndex = -1, closestDistance = 25;
    keyNodeDefinitions.forEach((nodeDefinition, index) => {
      const point = projectPoint(nodeDefinition), nodeDistance = Math.hypot(point.x - x, point.y - y);
      if (nodeDistance < closestDistance) {
        closestDistance = nodeDistance;
        closestNodeIndex = index;
      }
    });
    hoveredNodeIndex = closestNodeIndex;
    showNodeLabel(closestNodeIndex);
    if (isAnimationPaused()) drawNetwork();
  });
  networkCanvas.addEventListener("pointerleave", () => {
    hoveredNodeIndex = -1;
    pointerTilt = 0;
    showNodeLabel(-1);
  });
  networkCanvas.addEventListener("blur", () => {
    hoveredNodeIndex = -1;
    showNodeLabel(-1);
  });
  networkCanvas.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return;
    event.preventDefault();
    hoveredNodeIndex = (hoveredNodeIndex + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + keyNodeDefinitions.length) % keyNodeDefinitions.length;
    showNodeLabel(hoveredNodeIndex);
    drawNetwork();
  });
  new ResizeObserver(() => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeCanvas, 70);
  }).observe(networkCanvas);
  new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
    synchronizeAnimation();
  }).observe(networkCanvas);
  document.addEventListener("visibilitychange", synchronizeAnimation);
  document.addEventListener("motionchange", synchronizeAnimation);
  reducedMotion.addEventListener("change", synchronizeAnimation);
  document.addEventListener("themechange", () => {
    isLightTheme = document.documentElement.dataset.theme === "light";
    drawNetwork();
  });
  isLightTheme = document.documentElement.dataset.theme === "light";
  resizeCanvas();
}
export {
  initializeNeuralNetwork
};
