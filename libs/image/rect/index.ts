import { getRandomHslColor } from '../color';

const BaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50" fill="currentColor">
<rect width="100" height="50" x="0" y="0" />
</svg>`;

export function createRectSvg(
  minHue: number,
  maxHue: number,
  minSaturation: number,
  maxSaturation: number,
  minLightness: number,
  maxLightness: number
) {
  return BaseSvg.replace(
    'currentColor',
    getRandomHslColor(minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness)
  );
}
