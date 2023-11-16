import { getRandomHslColor } from '../color';

const BaseUserIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20" fill="currentColor">
<path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
</svg>`;

const BaseGroupIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="2 2 20 20" fill="currentColor">
<path fill-rule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clip-rule="evenodd" />
<path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
</svg>`;

export function createDefaultUserIconSvg(
  minHue: number,
  maxHue: number,
  minSaturation: number,
  maxSaturation: number,
  minLightness: number,
  maxLightness: number
) {
  return BaseUserIconSvg.replace(
    'currentColor',
    getRandomHslColor(minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness)
  );
}

export function createDefaultGroupIconSvg(
  minHue: number,
  maxHue: number,
  minSaturation: number,
  maxSaturation: number,
  minLightness: number,
  maxLightness: number
) {
  return BaseGroupIconSvg.replace(
    'currentColor',
    getRandomHslColor(minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness)
  );
}
