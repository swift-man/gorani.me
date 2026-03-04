export type RouteParamValue = string | string[] | undefined | null;

type MarketParamKey = 'symbol' | 'sector' | 'sectorName' | 'mobileSidebar';

const MARKET_PARAM_KEYS: readonly MarketParamKey[] = [
  'symbol',
  'sector',
  'sectorName',
  'mobileSidebar'
];
const MARKET_PARAM_KEYS_WITHOUT_MOBILE: readonly MarketParamKey[] = ['symbol', 'sector', 'sectorName'];

export const getFirstString = (value: RouteParamValue): string | undefined => {
  if (Array.isArray(value)) return typeof value[0] === 'string' ? value[0] : undefined;
  return typeof value === 'string' ? value : undefined;
};

export const isMobileSidebarParam = (value: RouteParamValue): boolean => {
  const normalized = getFirstString(value);
  return normalized === '1' || normalized === 'true';
};

type MarketRouteParamsInput = {
  symbol?: RouteParamValue;
  sector?: RouteParamValue;
  sectorName?: RouteParamValue;
  mobileSidebar?: RouteParamValue;
};

type BuildMarketRouteParamsOptions = {
  includeMobileSidebar?: boolean;
};

export const buildMarketRouteParams = (
  params: MarketRouteParamsInput,
  options: BuildMarketRouteParamsOptions = {}
): Record<string, string> => {
  const keys = options.includeMobileSidebar ? MARKET_PARAM_KEYS : MARKET_PARAM_KEYS_WITHOUT_MOBILE;
  const nextParams: Record<string, string> = {};

  keys.forEach((key) => {
    const value = getFirstString(params[key]);
    if (value) {
      nextParams[key] = value;
    }
  });

  return nextParams;
};
