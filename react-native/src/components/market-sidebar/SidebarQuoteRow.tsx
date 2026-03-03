import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { getStockIconUri } from '../../constants/stockIcons';
import {
  FLOW_COLUMN_WIDTH,
  LIGHT_SIDEBAR_BACKGROUND,
  LIST_HORIZONTAL_MARGIN,
  LIST_HORIZONTAL_PADDING,
  PRICE_COLUMN_WIDTH,
  PRICE_COLUMN_WIDTH_MOBILE,
  ROW_HEIGHT,
  SYMBOL_COLUMN_WIDTH,
  SYMBOL_COLUMN_WIDTH_MOBILE,
  SYMBOL_ICON_GAP,
  SYMBOL_ICON_SIZE,
  VOLUME_COLUMN_WIDTH,
  type LayoutMode,
  type QuoteItem
} from './config';

type SidebarQuoteRowProps = {
  item: QuoteItem;
  isDarkMode: boolean;
  isTwoColumnLayout: boolean;
  hideVolumeColumn: boolean;
  hideFlowColumns: boolean;
  layoutMode: LayoutMode;
  isMobileLayout?: boolean;
  detailBackground: string;
  trendColors: {
    rise: string;
    fall: string;
  };
  onPressQuote: (rank: number, symbol: string) => void;
};

const getSignedColorStyle = (
  value: number,
  isDarkMode: boolean,
  trendColors: { rise: string; fall: string }
) => {
  if (value > 0) return { color: trendColors.rise };
  if (value < 0) return { color: trendColors.fall };
  return isDarkMode ? styles.neutralValueDark : styles.neutralValueLight;
};

export default function SidebarQuoteRow({
  item,
  isDarkMode,
  isTwoColumnLayout,
  hideVolumeColumn,
  hideFlowColumns,
  layoutMode,
  isMobileLayout = false,
  detailBackground,
  trendColors,
  onPressQuote
}: SidebarQuoteRowProps) {
  const priceChangeColorStyle = getSignedColorStyle(item.changeRate, isDarkMode, trendColors);
  const stockIconUri = getStockIconUri(item.symbol);
  const titleIconColor =
    item.titleIconName === 'newspaper-outline'
      ? '#FFB540'
      : item.titleIconName === 'document-text-outline'
        ? '#0882FF'
        : isDarkMode
          ? '#cbd5e1'
          : '#64748b';
  const stickySymbolWebStyle =
    Platform.OS === 'web'
      ? ({
          position: 'sticky',
          left: 0,
          zIndex: 3,
          backgroundColor: isDarkMode ? detailBackground : LIGHT_SIDEBAR_BACKGROUND
        } as any)
      : null;
  const noWrapOverflowWebStyle =
    Platform.OS === 'web'
      ? ({
          whiteSpace: 'nowrap',
          overflow: 'visible'
        } as any)
      : null;

  return (
    <Pressable
      onPress={() => onPressQuote(item.rank, item.symbol)}
      style={[
        styles.listItem,
        { backgroundColor: isDarkMode ? detailBackground : LIGHT_SIDEBAR_BACKGROUND }
      ]}
    >
      <View
        style={[
          styles.symbolColumn,
          isTwoColumnLayout && styles.symbolColumnTwoColumn,
          isMobileLayout && styles.symbolColumnMobile,
          stickySymbolWebStyle
        ]}
      >
        <View style={styles.symbolIcon}>
          <Image source={{ uri: stockIconUri }} style={styles.symbolIconImage} />
        </View>
        <View style={styles.symbolMeta}>
          <View style={styles.symbolMetaTopRow}>
            <Text
              style={[
                styles.symbolNameTop,
                isDarkMode && styles.symbolNameTopDark,
                layoutMode >= 3 && styles.symbolNameTopCompact,
                noWrapOverflowWebStyle
              ]}
            >
              {item.stockName}
            </Text>
            {item.titleIconName ? (
              <Ionicons
                name={item.titleIconName as any}
                size={11}
                style={styles.symbolNameTopIcon}
                color={titleIconColor}
              />
            ) : null}
          </View>
          <Text style={[styles.symbol, isDarkMode && styles.symbolDark, noWrapOverflowWebStyle]}>
            {item.symbol}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.priceInfoColumn,
          isTwoColumnLayout && styles.priceInfoColumnTwoColumn,
          isMobileLayout && styles.priceInfoColumnMobile
        ]}
      >
        <Text style={[styles.priceTop, priceChangeColorStyle, noWrapOverflowWebStyle]}>
          {item.currentPrice}
        </Text>
        <Text style={[styles.priceBottom, priceChangeColorStyle, noWrapOverflowWebStyle]}>
          {item.changeAmount} {item.changePercent}
        </Text>
      </View>
      {!hideVolumeColumn && (
        <View style={styles.volumeInfoColumn}>
          <Text style={[styles.metricValue, isDarkMode && styles.metricValueDark]} numberOfLines={1}>
            {item.volume}
          </Text>
        </View>
      )}
      {!hideFlowColumns && (
        <>
          <View style={styles.personalInfoColumn}>
            <Text
              style={[
                styles.metricSignedValue,
                getSignedColorStyle(item.personalFlowValue, isDarkMode, trendColors)
              ]}
              numberOfLines={1}
            >
              {item.personalFlow}
            </Text>
          </View>
          <View style={styles.foreignInfoColumn}>
            <Text
              style={[
                styles.metricSignedValue,
                getSignedColorStyle(item.foreignFlowValue, isDarkMode, trendColors)
              ]}
              numberOfLines={1}
            >
              {item.foreignFlow}
            </Text>
          </View>
          <View style={styles.institutionInfoColumn}>
            <Text
              style={[
                styles.metricSignedValue,
                getSignedColorStyle(item.institutionalFlowValue, isDarkMode, trendColors)
              ]}
              numberOfLines={1}
            >
              {item.institutionalFlow}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  listItem: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
    marginHorizontal: LIST_HORIZONTAL_MARGIN,
    overflow: 'visible'
  },
  symbolColumn: {
    width: SYMBOL_COLUMN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center'
  },
  symbolColumnTwoColumn: {
    width: SYMBOL_COLUMN_WIDTH
  },
  symbolColumnMobile: {
    width: SYMBOL_COLUMN_WIDTH_MOBILE
  },
  symbolIcon: {
    width: SYMBOL_ICON_SIZE,
    height: SYMBOL_ICON_SIZE,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SYMBOL_ICON_GAP,
    overflow: 'hidden',
    backgroundColor: '#0f172a12'
  },
  symbolIconImage: {
    width: '100%',
    height: '100%'
  },
  symbolMeta: {
    minWidth: 0,
    flex: 1,
    justifyContent: 'center',
    overflow: 'visible'
  },
  symbolMetaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0
  },
  symbolNameTopIcon: {
    marginLeft: 4
  },
  symbolNameTop: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    flexShrink: 0
  },
  symbolNameTopCompact: {
    maxWidth: 74
  },
  symbolNameTopDark: {
    color: '#cbd5e1'
  },
  symbol: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
    flexShrink: 0
  },
  symbolDark: {
    color: '#e2e8f0'
  },
  priceInfoColumn: {
    width: PRICE_COLUMN_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  priceInfoColumnTwoColumn: {
    width: PRICE_COLUMN_WIDTH
  },
  priceInfoColumnMobile: {
    width: PRICE_COLUMN_WIDTH_MOBILE
  },
  priceTop: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a'
  },
  priceBottom: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 0
  },
  volumeInfoColumn: {
    width: VOLUME_COLUMN_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  personalInfoColumn: {
    width: FLOW_COLUMN_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  foreignInfoColumn: {
    width: FLOW_COLUMN_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  institutionInfoColumn: {
    width: FLOW_COLUMN_WIDTH,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  metricValueDark: {
    color: '#e2e8f0'
  },
  metricSignedValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155'
  },
  neutralValueLight: {
    color: '#000000'
  },
  neutralValueDark: {
    color: '#ffffff'
  }
});
