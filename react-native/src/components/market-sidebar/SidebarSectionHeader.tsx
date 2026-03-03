import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  DARK_BORDER_COLOR,
  FLOW_COLUMN_WIDTH,
  LIGHT_SIDEBAR_BACKGROUND,
  LIGHT_SIDEBAR_BORDER,
  LIST_HORIZONTAL_MARGIN,
  LIST_HORIZONTAL_PADDING,
  PRICE_COLUMN_WIDTH,
  PRICE_COLUMN_WIDTH_MOBILE,
  SECTION_HEADER_HEIGHT,
  SYMBOL_COLUMN_WIDTH,
  SYMBOL_COLUMN_WIDTH_MOBILE,
  SYMBOL_ICON_GAP,
  SYMBOL_ICON_SIZE,
  VOLUME_COLUMN_WIDTH
} from './config';

type SidebarSectionHeaderProps = {
  isDarkMode: boolean;
  isTwoColumnLayout: boolean;
  hideVolumeColumn: boolean;
  hideFlowColumns: boolean;
  isMobileLayout?: boolean;
};

export default function SidebarSectionHeader({
  isDarkMode,
  isTwoColumnLayout,
  hideVolumeColumn,
  hideFlowColumns,
  isMobileLayout = false
}: SidebarSectionHeaderProps) {
  const stickySymbolWebStyle =
    Platform.OS === 'web'
      ? ({
          position: 'sticky',
          left: 0,
          zIndex: 4,
          backgroundColor: isDarkMode ? '#212429' : LIGHT_SIDEBAR_BACKGROUND
        } as any)
      : null;

  return (
    <View
      style={[
        styles.sectionHeader,
        {
          backgroundColor: isDarkMode ? '#212429' : LIGHT_SIDEBAR_BACKGROUND,
          borderBottomColor: isDarkMode ? DARK_BORDER_COLOR : LIGHT_SIDEBAR_BORDER
        }
      ]}
    >
      <View
        style={[
          styles.symbolHeaderColumn,
          isTwoColumnLayout && styles.symbolHeaderColumnTwoColumn,
          isMobileLayout && styles.symbolHeaderColumnMobile,
          stickySymbolWebStyle
        ]}
      >
        <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>종목 정보</Text>
      </View>
      <Text
        style={[
          styles.sectionHeaderText,
          styles.priceHeaderColumn,
          isTwoColumnLayout && styles.priceHeaderColumnTwoColumn,
          isMobileLayout && styles.priceHeaderColumnMobile,
          isDarkMode && styles.sectionHeaderTextDark
        ]}
      >
        가격 정보
      </Text>
      {!hideVolumeColumn && (
        <Text style={[styles.sectionHeaderText, styles.volumeHeaderColumn, isDarkMode && styles.sectionHeaderTextDark]}>
          거래대금
        </Text>
      )}
      {!hideFlowColumns && (
        <>
          <Text style={[styles.sectionHeaderText, styles.personalHeaderColumn, isDarkMode && styles.sectionHeaderTextDark]}>
            개인
          </Text>
          <Text style={[styles.sectionHeaderText, styles.foreignHeaderColumn, isDarkMode && styles.sectionHeaderTextDark]}>
            외국인
          </Text>
          <Text style={[styles.sectionHeaderText, styles.institutionHeaderColumn, isDarkMode && styles.sectionHeaderTextDark]}>
            기관
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    height: SECTION_HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: LIST_HORIZONTAL_PADDING,
    marginHorizontal: LIST_HORIZONTAL_MARGIN,
    borderBottomWidth: 1
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155'
  },
  sectionHeaderTextDark: {
    color: '#cbd5e1'
  },
  symbolHeaderColumn: {
    width: SYMBOL_COLUMN_WIDTH,
    textAlign: 'left',
    paddingLeft: SYMBOL_ICON_SIZE + SYMBOL_ICON_GAP
  },
  symbolHeaderColumnTwoColumn: {
    width: SYMBOL_COLUMN_WIDTH
  },
  symbolHeaderColumnMobile: {
    width: SYMBOL_COLUMN_WIDTH_MOBILE,
    paddingLeft: SYMBOL_ICON_SIZE + 6
  },
  priceHeaderColumn: {
    width: PRICE_COLUMN_WIDTH,
    textAlign: 'right'
  },
  priceHeaderColumnTwoColumn: {
    width: PRICE_COLUMN_WIDTH
  },
  priceHeaderColumnMobile: {
    width: PRICE_COLUMN_WIDTH_MOBILE
  },
  volumeHeaderColumn: {
    width: VOLUME_COLUMN_WIDTH,
    textAlign: 'right'
  },
  personalHeaderColumn: {
    width: FLOW_COLUMN_WIDTH,
    textAlign: 'right'
  },
  foreignHeaderColumn: {
    width: FLOW_COLUMN_WIDTH,
    textAlign: 'right'
  },
  institutionHeaderColumn: {
    width: FLOW_COLUMN_WIDTH,
    textAlign: 'right'
  }
});
