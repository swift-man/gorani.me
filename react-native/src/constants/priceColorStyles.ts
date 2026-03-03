export const PRICE_COLOR_STYLE_PRESETS = {
  eastern: {
    label: '동양식',
    rise: '#dc2626',
    fall: '#2563eb'
  },
  western: {
    label: '서양식',
    rise: '#07CDA5',
    fall: '#FF2D8A'
  }
} as const;

export type PriceColorStyle = keyof typeof PRICE_COLOR_STYLE_PRESETS;

export const DEFAULT_PRICE_COLOR_STYLE: PriceColorStyle = 'eastern';

export const PRICE_COLOR_STYLE_ORDER: PriceColorStyle[] = ['eastern', 'western'];

export function isPriceColorStyle(value: string): value is PriceColorStyle {
  return Object.prototype.hasOwnProperty.call(PRICE_COLOR_STYLE_PRESETS, value);
}
