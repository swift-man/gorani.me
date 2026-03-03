export const ROW_HEIGHT = 50;
export const ROW_SEPARATOR_HEIGHT = 1;
export const SECTION_HEADER_HEIGHT = 32;
export const SYMBOL_ICON_SIZE = 32;
export const SYMBOL_ICON_GAP = 10;
export const LIST_HORIZONTAL_MARGIN = 6;
export const LIST_HORIZONTAL_PADDING = 10;
export const SCROLL_HINT_HEIGHT = 22;
export const MIN_PANEL_WIDTH = 220;
export const COLLAPSED_PANEL_WIDTH = 56;
export const RESIZE_COLLAPSE_THRESHOLD = 188;
export const RESIZE_HANDLE_MARGIN_WIDTH = 20;
export const UNFOLD_HORIZONTAL_CODEPOINT = 58433;
export const DARK_BORDER_COLOR = '#36363B';
export const LIGHT_SIDEBAR_BACKGROUND = '#ffffff';
export const LIGHT_SIDEBAR_BORDER = '#e5e7eb';
export const HIDE_FLOW_COLUMNS_WIDTH = 470;
export const HIDE_VOLUME_COLUMN_WIDTH = 340;
export const COMPACT_SYMBOL_NAME_WIDTH = 270;

export type LayoutMode = 0 | 1 | 2 | 3;

export type QuoteItem = {
  rank: number;
  stockName: string;
  symbol: string;
  currentPrice: string;
  changeRate: number;
  changePercent: string;
  changeAmount: string;
  volume: string;
  titleIconName: 'newspaper-outline' | 'document-text-outline' | null;
  personalFlow: string;
  foreignFlow: string;
  institutionalFlow: string;
  personalFlowValue: number;
  foreignFlowValue: number;
  institutionalFlowValue: number;
};

const formatMan = (value: number) => `${value.toLocaleString('ko-KR')}만`;
const formatSignedMan = (value: number) => `${value >= 0 ? '+' : ''}${value.toLocaleString('ko-KR')}만`;

export const getLayoutMode = (panelWidth: number): LayoutMode => {
  if (panelWidth <= COMPACT_SYMBOL_NAME_WIDTH) return 3;
  if (panelWidth <= HIDE_VOLUME_COLUMN_WIDTH) return 2;
  if (panelWidth <= HIDE_FLOW_COLUMNS_WIDTH) return 1;
  return 0;
};

export const mockQuotes: QuoteItem[] = Array.from({ length: 80 }, (_, index) => {
  const rank = index + 1;
  const symbol = `KRW-COIN${rank}`;
  const stockName = `코인 ${rank}`;
  const currentPriceNumber = 1000 + rank * 17;
  const currentPrice = currentPriceNumber.toLocaleString();
  const changeRate = Number((((rank % 19) - 9) * 0.37).toFixed(2));
  const changePercent = `${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(2)}%`;
  const changeAmountNumber = Math.round(currentPriceNumber * (changeRate / 100));
  const changeAmount = `${changeAmountNumber >= 0 ? '+' : ''}${changeAmountNumber.toLocaleString()}`;
  const volumeInMan = 327000 + rank * 351;
  const titleIconName =
    rank % 7 === 0 ? 'newspaper-outline' : rank % 11 === 0 ? 'document-text-outline' : null;
  const personalFlowValue = (rank % 13 - 6) * 130;
  const foreignFlowValue = (rank % 11 - 5) * 95;
  const institutionalFlowValue = -Math.round((personalFlowValue + foreignFlowValue) * 0.8);

  return {
    rank,
    stockName,
    symbol,
    currentPrice,
    changeRate,
    changePercent,
    changeAmount,
    volume: formatMan(volumeInMan),
    titleIconName,
    personalFlow: formatSignedMan(personalFlowValue),
    foreignFlow: formatSignedMan(foreignFlowValue),
    institutionalFlow: formatSignedMan(institutionalFlowValue),
    personalFlowValue,
    foreignFlowValue,
    institutionalFlowValue
  };
});
