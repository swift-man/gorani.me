export const STOCK_ICON_URIS = [
  'https://static.toss.im/png-icons/securities/icn-sec-fill-005930.png',
  'https://static.toss.im/png-icons/securities/icn-sec-fill-035420.png',
  'https://static.toss.im/png-icons/securities/icn-sec-fill-000660.png',
  'https://static.toss.im/png-icons/securities/icn-sec-fill-005380.png'
] as const;

export function getStockIconUri(symbol: string) {
  const hash = Array.from(symbol).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return STOCK_ICON_URIS[hash % STOCK_ICON_URIS.length];
}
