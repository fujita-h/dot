/**
 * get random HSL color
 *
 * hue: 0 - 360
 * saturation: 0 - 100
 * lightness: 0 - 100
 *
 * @param minHue minimum hue value
 * @param maxHue maximum hue value
 * @param minSaturation minimum saturation value
 * @param maxSaturation maximum saturation value
 * @param minLightness minimum lightness value
 * @param maxLightness maximum lightness value
 * @returns HSL color string
 */
export function getRandomHslColor(
  minHue: number,
  maxHue: number,
  minSaturation: number,
  maxSaturation: number,
  minLightness: number,
  maxLightness: number
) {
  if (minHue < 0 || maxHue > 360) throw new Error('hue must be between 0 and 360');
  if (minSaturation < 0 || maxSaturation > 100) throw new Error('saturation must be between 0 and 100');
  if (minLightness < 0 || maxLightness > 100) throw new Error('lightness must be between 0 and 100');

  const hue = getRandomInt(minHue, maxHue);
  const saturation = getRandomInt(minSaturation, maxSaturation);
  const lightness = getRandomInt(minLightness, maxLightness);

  // return HSL color string
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
