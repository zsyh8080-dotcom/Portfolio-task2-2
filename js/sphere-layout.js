export function getSphereLayout(width, height) {
  return {
    centerX: width * 0.51,
    centerY: height * 0.52,
    radius: Math.min(width, height) * 0.405
  };
}
