import React from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { getStockIconUri } from '../../constants/stockIcons';
import {
  LIGHT_SIDEBAR_BACKGROUND,
  LIST_HORIZONTAL_MARGIN,
  LIST_HORIZONTAL_PADDING,
  ROW_HEIGHT,
  SYMBOL_ICON_GAP,
  SYMBOL_ICON_SIZE,
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

  return (
    <Pressable
      onPress={() => onPressQuote(item.rank, item.symbol)}
      style={[
        styles.listItem,
        { backgroundColor: isDarkMode ? detailBackground : LIGHT_SIDEBAR_BACKGROUND }
      ]}
    >
      <View style={[styles.symbolColumn, isTwoColumnLayout && styles.symbolColumnTwoColumn]}>
        <View style={styles.symbolIcon}>
          <Image source={{ uri: stockIconUri }} style={styles.symbolIconImage} />
        </View>
        <View style={styles.symbolMeta}>
          <View style={styles.symbolMetaTopRow}>
            <Text
              style={[
                styles.symbolNameTop,
                isDarkMode && styles.symbolNameTopDark,
                layoutMode >= 3 && styles.symbolNameTopCompact
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
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
          <Text style={[styles.symbol, isDarkMode && styles.symbolDark]} numberOfLines={1}>
            {item.symbol}
          </Text>
        </View>
      </View>
      <View style={[styles.priceInfoColumn, isTwoColumnLayout && styles.priceInfoColumnTwoColumn]}>
        <Text style={[styles.priceTop, priceChangeColorStyle]} numberOfLines={1}>
          {item.currentPrice}
        </Text>
        <Text style={[styles.priceBottom, priceChangeColorStyle]} numberOfLines={1}>
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
    marginHorizontal: LIST_HORIZONTAL_MARGIN
  },
  symbolColumn: {
    flex: 2.25,
    flexDirection: 'row',
    alignItems: 'center'
  },
  symbolColumnTwoColumn: {
    flex: 1.95
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
    justifyContent: 'center'
  },
  symbolMetaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1
  },
  symbolNameTopIcon: {
    marginLeft: 4
  },
  symbolNameTop: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    flexShrink: 1
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
    flexShrink: 1
  },
  symbolDark: {
    color: '#e2e8f0'
  },
  priceInfoColumn: {
    flex: 1.6,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  priceInfoColumnTwoColumn: {
    flex: 1.85
  },
  priceTop: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a'
  },
  priceBottom: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1
  },
  volumeInfoColumn: {
    flex: 1.1,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  personalInfoColumn: {
    flex: 1.0,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  foreignInfoColumn: {
    flex: 1.0,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  institutionInfoColumn: {
    flex: 1.0,
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  metricValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155'
  },
  metricValueDark: {
    color: '#e2e8f0'
  },
  metricSignedValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155'
  },
  neutralValueLight: {
    color: '#000000'
  },
  neutralValueDark: {
    color: '#ffffff'
  }
});
