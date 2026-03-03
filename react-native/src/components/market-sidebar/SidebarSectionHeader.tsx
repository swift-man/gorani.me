import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  DARK_BORDER_COLOR,
  LIGHT_SIDEBAR_BACKGROUND,
  LIGHT_SIDEBAR_BORDER,
  LIST_HORIZONTAL_MARGIN,
  LIST_HORIZONTAL_PADDING,
  SECTION_HEADER_HEIGHT,
  SYMBOL_ICON_GAP,
  SYMBOL_ICON_SIZE
} from './config';

type SidebarSectionHeaderProps = {
  isDarkMode: boolean;
  isTwoColumnLayout: boolean;
  hideVolumeColumn: boolean;
  hideFlowColumns: boolean;
};

export default function SidebarSectionHeader({
  isDarkMode,
  isTwoColumnLayout,
  hideVolumeColumn,
  hideFlowColumns
}: SidebarSectionHeaderProps) {
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
      <Text
        style={[
          styles.sectionHeaderText,
          styles.symbolHeaderColumn,
          isTwoColumnLayout && styles.symbolHeaderColumnTwoColumn,
          isDarkMode && styles.sectionHeaderTextDark
        ]}
      >
        종목 정보
      </Text>
      <Text
        style={[
          styles.sectionHeaderText,
          styles.priceHeaderColumn,
          isTwoColumnLayout && styles.priceHeaderColumnTwoColumn,
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
    fontSize: 11,
    fontWeight: '700',
    color: '#334155'
  },
  sectionHeaderTextDark: {
    color: '#cbd5e1'
  },
  symbolHeaderColumn: {
    flex: 2.25,
    textAlign: 'left',
    paddingLeft: SYMBOL_ICON_SIZE + SYMBOL_ICON_GAP
  },
  symbolHeaderColumnTwoColumn: {
    flex: 1.95
  },
  priceHeaderColumn: {
    flex: 1.6,
    textAlign: 'right'
  },
  priceHeaderColumnTwoColumn: {
    flex: 1.85
  },
  volumeHeaderColumn: {
    flex: 1.1,
    textAlign: 'right'
  },
  personalHeaderColumn: {
    flex: 1.0,
    textAlign: 'right'
  },
  foreignHeaderColumn: {
    flex: 1.0,
    textAlign: 'right'
  },
  institutionHeaderColumn: {
    flex: 1.0,
    textAlign: 'right'
  }
});
