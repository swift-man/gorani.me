const MARKET_ROUTE_PREFIXES = ['/communities', '/prices', '/prediction', '/news'] as const;

export const isMarketRoutePath = (pathname: string): boolean =>
  MARKET_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
