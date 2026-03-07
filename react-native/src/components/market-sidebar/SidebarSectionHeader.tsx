import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import {
  DARK_BORDER_COLOR,
  FLOW_COLUMN_WIDTH,
  INSTITUTION_COLUMN_EXTRA_WIDTH,
  INSTITUTION_COLUMN_RIGHT_PADDING,
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
          backgroundColor: isDarkMode ? '#212429' : LIGHT_SIDEBAR_BACKGROUND
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
      <View
        style={[
          styles.priceHeaderColumn,
          isTwoColumnLayout && styles.priceHeaderColumnTwoColumn,
          isMobileLayout && styles.priceHeaderColumnMobile
        ]}
      >
        <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>가격 정보</Text>
      </View>
      {!hideVolumeColumn && (
        <View style={styles.volumeHeaderColumn}>
          <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>거래대금</Text>
        </View>
      )}
      {!hideFlowColumns && (
        <>
          <View style={styles.personalHeaderColumn}>
            <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>개인</Text>
          </View>
          <View style={styles.foreignHeaderColumn}>
            <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>외국인</Text>
          </View>
          <View style={styles.institutionHeaderColumn}>
            <Text style={[styles.sectionHeaderText, isDarkMode && styles.sectionHeaderTextDark]}>기관</Text>
          </View>
        </>
      )}
      <View style={[styles.sectionHeaderDivider, isDarkMode && styles.sectionHeaderDividerDark]} />
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
    position: 'relative'
  },
  sectionHeaderDivider: {
    position: 'absolute',
    left: LIST_HORIZONTAL_PADDING,
    right: 0,
    bottom: 0,
    height: 1,
    backgroundColor: LIGHT_SIDEBAR_BORDER
  },
  sectionHeaderDividerDark: {
    backgroundColor: DARK_BORDER_COLOR
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
    alignItems: 'flex-end'
  },
  priceHeaderColumnTwoColumn: {
    width: PRICE_COLUMN_WIDTH
  },
  priceHeaderColumnMobile: {
    width: PRICE_COLUMN_WIDTH_MOBILE
  },
  volumeHeaderColumn: {
    width: VOLUME_COLUMN_WIDTH,
    alignItems: 'flex-end'
  },
  personalHeaderColumn: {
    width: FLOW_COLUMN_WIDTH,
    alignItems: 'flex-end'
  },
  foreignHeaderColumn: {
    width: FLOW_COLUMN_WIDTH,
    alignItems: 'flex-end'
  },
  institutionHeaderColumn: {
    width: FLOW_COLUMN_WIDTH + INSTITUTION_COLUMN_EXTRA_WIDTH,
    paddingRight: INSTITUTION_COLUMN_RIGHT_PADDING,
    alignItems: 'flex-end'
  }
});
