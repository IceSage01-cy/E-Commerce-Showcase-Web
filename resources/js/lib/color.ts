/** "#RRGGBB" to an rgba() string. Falls back to the shop pink for anything that isn't a 6-digit hex colour. */
export const hexToRgba = (hex: string, alpha: number) => {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!m) return `rgba(255,45,120,${alpha})`;
  return `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${alpha})`;
};
