import React from 'react';
import { useFonts } from 'expo-font';
import { Image, Modal, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Lucide } from '@react-native-vector-icons/lucide';
import { router, useGlobalSearchParams, usePathname } from 'expo-router';

import {
  PRICE_COLOR_STYLE_ORDER,
  PRICE_COLOR_STYLE_PRESETS
} from '../constants/priceColorStyles';
import { sections } from '../screens/types';
import { type PriceColorStyle, type ThemeMode, useWebTheme } from '../theme/WebThemeContext';

const BRAND_ICON = require('../assets/gorani.png');
const MOBILE_WEB_BREAKPOINT = 900;
const THEME_MODE_ORDER: ThemeMode[] = ['light', 'dark', 'system'];
const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  light: '밝은 모드',
  dark: '어두운 모드',
  system: '기기'
};

const getFirstString = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const isMarketRoutePath = (pathname: string) =>
  pathname.startsWith('/communities') ||
  pathname.startsWith('/prices') ||
  pathname.startsWith('/prediction') ||
  pathname.startsWith('/news');

export default function WebTopBar() {
  const pathname = usePathname();
  const params = useGlobalSearchParams<{
    symbol?: string | string[];
    sector?: string | string[];
    sectorName?: string | string[];
    mobileSidebar?: string | string[];
  }>();
  const { width } = useWindowDimensions();
  const [fontsLoaded] = useFonts({
    Lucide: require('@react-native-vector-icons/lucide/fonts/Lucide.ttf')
  });
  const {
    themeMode,
    setThemeMode,
    priceColorStyle,
    setPriceColorStyle,
    colors,
    resolvedMode,
    trendColors
  } =
    useWebTheme();

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [themeSubmenuOpen, setThemeSubmenuOpen] = React.useState(false);
  const [colorSubmenuOpen, setColorSubmenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const isProfileRoot = pathname === '/profile' || pathname === '/profile/';
  const isBrandSelected =
    pathname === '/' ||
    pathname === '/communities' ||
    pathname.startsWith('/communities/') ||
    pathname === '/prices' ||
    pathname.startsWith('/prices/');
  const tabSelectedBackground = resolvedMode === 'dark' ? '#ffffff' : colors.selectedTabBackground;
  const tabSelectedText = resolvedMode === 'dark' ? '#0f172a' : '#ffffff';
  const isMobileWeb = width <= MOBILE_WEB_BREAKPOINT;
  const isMarketRoute = isMarketRoutePath(pathname);
  const mobileSidebarRaw = getFirstString(params.mobileSidebar);
  const isMobileSidebarView = mobileSidebarRaw === '1' || mobileSidebarRaw === 'true';
  const showMobileCollapseButton = isMobileWeb && isMarketRoute;

  React.useEffect(() => {
    setSettingsOpen(false);
    setThemeSubmenuOpen(false);
    setColorSubmenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const selectedThemeLabel = THEME_MODE_LABELS[themeMode];

  const handleThemeSelect = (nextMode: ThemeMode) => {
    setThemeMode(nextMode);
    setThemeSubmenuOpen(false);
    setColorSubmenuOpen(false);
    setSettingsOpen(false);
  };

  const handleColorSelect = (nextStyle: PriceColorStyle) => {
    setPriceColorStyle(nextStyle);
    setColorSubmenuOpen(false);
    setThemeSubmenuOpen(false);
    setSettingsOpen(false);
  };

  const handleMobileCollapsePress = React.useCallback(() => {
    const nextParams: Record<string, string> = {};
    const symbol = getFirstString(params.symbol);
    const sector = getFirstString(params.sector);
    const sectorName = getFirstString(params.sectorName);

    if (symbol) nextParams.symbol = symbol;
    if (sector) nextParams.sector = sector;
    if (sectorName) nextParams.sectorName = sectorName;
    if (!isMobileSidebarView) {
      nextParams.mobileSidebar = '1';
    }

    if (Object.keys(nextParams).length === 0) {
      router.push(pathname);
      return;
    }

    router.push({ pathname, params: nextParams } as any);
  }, [isMobileSidebarView, params.sector, params.sectorName, params.symbol, pathname]);

  return (
    <View style={[styles.container, { backgroundColor: colors.topBarBackground }]}>
      {showMobileCollapseButton && (
        <Pressable
          style={[
            styles.mobileCollapseButton,
            {
              backgroundColor: colors.iconButtonBackground,
              borderColor: resolvedMode === 'dark' ? '#36363B' : '#e2e8f0'
            }
          ]}
          onPress={handleMobileCollapsePress}
        >
          {fontsLoaded ? (
            <Lucide
              name="panel-right"
              size={16}
              color={colors.textPrimary}
              style={isMobileSidebarView && styles.mobileCollapseButtonIconOpen}
            />
          ) : (
            <View style={styles.mobileCollapseButtonIconPlaceholder} />
          )}
        </Pressable>
      )}
      <Pressable
        style={[
          styles.brandButton,
          isBrandSelected && styles.brandButtonSelected,
          isBrandSelected && { backgroundColor: tabSelectedBackground }
        ]}
        onPress={() => router.push('/communities')}
      >
        <Image source={BRAND_ICON} style={styles.brandIcon} />
      </Pressable>

      {sections
        .filter((section) => section.key !== 'profile' && section.key !== 'prices')
        .map((section) => {
          const selected =
            pathname === section.webPath || pathname.startsWith(`${section.webPath}/`);

          return (
            <Pressable
              key={section.key}
              style={[styles.item, selected && { backgroundColor: tabSelectedBackground }]}
              onPress={() => router.push(section.webPath)}
            >
              <Text style={[styles.text, { color: selected ? tabSelectedText : colors.textPrimary }]}>
                {section.title}
              </Text>
            </Pressable>
          );
        })}

      <Pressable
        style={[
          styles.searchTrigger,
          {
            backgroundColor: resolvedMode === 'dark' ? '#2c313b' : '#f8fafc',
            borderColor: resolvedMode === 'dark' ? '#36363B' : '#e2e8f0'
          }
        ]}
        onPress={() => setSearchOpen(true)}
      >
        <Ionicons name="search" size={16} color={colors.textPrimary} />
        <Text style={[styles.searchPlaceholder, { color: resolvedMode === 'dark' ? '#94a3b8' : '#64748b' }]}>
          검색하세요.
        </Text>
      </Pressable>

      {!isMobileWeb && (
        <Pressable
          style={[
            styles.downloadButton,
            {
              backgroundColor: resolvedMode === 'dark' ? '#2c313b' : '#f8fafc',
              borderColor: resolvedMode === 'dark' ? '#36363B' : '#e2e8f0'
            }
          ]}
        >
          <MaterialCommunityIcons name="qrcode-scan" size={16} color={colors.textPrimary} />
          <Text style={[styles.downloadButtonText, { color: colors.textPrimary }]}>앱 다운로드</Text>
        </Pressable>
      )}

      {!isMobileWeb && (
        <View style={styles.settingsWrap}>
          <Pressable
            style={[
              styles.iconButton,
              { backgroundColor: colors.iconButtonBackground },
              settingsOpen && { backgroundColor: colors.selectedTabBackground }
            ]}
            onPress={() => {
              setSettingsOpen((prev) => !prev);
              if (settingsOpen) {
                setThemeSubmenuOpen(false);
                setColorSubmenuOpen(false);
              }
            }}
          >
            <Ionicons name="settings" size={18} color={settingsOpen ? '#ffffff' : colors.textPrimary} />
          </Pressable>

          {settingsOpen && (
            <View
              style={[
                styles.settingsMenu,
                { backgroundColor: colors.menuBackground, borderColor: colors.menuBorder }
              ]}
            >
            <View style={styles.menuRowWrap}>
              <Pressable
                style={[
                  styles.menuItem,
                  themeSubmenuOpen && { backgroundColor: colors.menuHoverBackground }
                ]}
                onHoverIn={() => {
                  setThemeSubmenuOpen(true);
                  setColorSubmenuOpen(false);
                }}
                onPress={() => {
                  setThemeSubmenuOpen((prev) => !prev);
                  setColorSubmenuOpen(false);
                }}
              >
                <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                  {selectedThemeLabel}
                </Text>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary} />
              </Pressable>

              {themeSubmenuOpen && (
                <View
                  style={[
                    styles.submenu,
                    { backgroundColor: colors.menuBackground, borderColor: colors.menuBorder }
                  ]}
                >
                  {THEME_MODE_ORDER.map((mode) => (
                    <Pressable
                      key={mode}
                      style={({ pressed }) => [
                        styles.submenuItem,
                        pressed && { backgroundColor: colors.menuHoverBackground }
                      ]}
                      onPress={() => handleThemeSelect(mode)}
                    >
                      <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                        {THEME_MODE_LABELS[mode]}
                      </Text>
                      {themeMode === mode && (
                        <Ionicons name="checkmark" size={14} color={colors.textPrimary} />
                      )}
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.menuRowWrap}>
              <Pressable
                style={[
                  styles.menuItem,
                  colorSubmenuOpen && { backgroundColor: colors.menuHoverBackground }
                ]}
                onHoverIn={() => {
                  setColorSubmenuOpen(true);
                  setThemeSubmenuOpen(false);
                }}
                onPress={() => {
                  setColorSubmenuOpen((prev) => !prev);
                  setThemeSubmenuOpen(false);
                }}
              >
                <View style={styles.menuColorTitle}>
                  <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>색상</Text>
                  <View style={styles.menuColorIcons}>
                    <MaterialCommunityIcons
                      name="arrow-up-bold"
                      size={13}
                      color={trendColors.rise}
                      style={styles.menuColorIcon}
                    />
                    <MaterialCommunityIcons
                      name="arrow-down-bold"
                      size={13}
                      color={trendColors.fall}
                    />
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.textPrimary} />
              </Pressable>

              {colorSubmenuOpen && (
                <View
                  style={[
                    styles.submenu,
                    { backgroundColor: colors.menuBackground, borderColor: colors.menuBorder }
                  ]}
                >
                  {PRICE_COLOR_STYLE_ORDER.map((styleKey) => {
                    const preset = PRICE_COLOR_STYLE_PRESETS[styleKey];
                    return (
                      <Pressable
                        key={styleKey}
                        style={({ pressed }) => [
                          styles.submenuItem,
                          pressed && { backgroundColor: colors.menuHoverBackground }
                        ]}
                        onPress={() => handleColorSelect(styleKey)}
                      >
                        <View style={styles.colorOptionLabel}>
                          <Text style={[styles.menuItemText, { color: colors.textPrimary }]}>
                            {preset.label}
                          </Text>
                          <View style={styles.colorOptionIcons}>
                            <MaterialCommunityIcons
                              name="arrow-up-bold"
                              size={13}
                              color={preset.rise}
                              style={styles.colorOptionIcon}
                            />
                            <MaterialCommunityIcons
                              name="arrow-down-bold"
                              size={13}
                              color={preset.fall}
                            />
                          </View>
                        </View>
                        {priceColorStyle === styleKey && (
                          <Ionicons name="checkmark" size={14} color={colors.textPrimary} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
            </View>
          )}
        </View>
      )}

      <Pressable
        style={[
          styles.iconButton,
          styles.profileButton,
          { backgroundColor: colors.iconButtonBackground },
          isProfileRoot && { backgroundColor: colors.selectedTabBackground }
        ]}
        onPress={() => router.push('/profile')}
      >
        <Ionicons name="person" size={18} color={isProfileRoot ? '#ffffff' : colors.textPrimary} />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={searchOpen}
        onRequestClose={() => setSearchOpen(false)}
      >
        <View style={styles.searchModalOverlay}>
          <Pressable style={styles.searchModalBackdrop} onPress={() => setSearchOpen(false)} />
          <View
            style={[
              styles.searchModalCard,
              { backgroundColor: colors.menuBackground, borderColor: colors.menuBorder }
            ]}
          >
            <View style={styles.searchModalHeader}>
              <Text style={[styles.searchModalTitle, { color: colors.textPrimary }]}>검색</Text>
              <Pressable style={styles.searchCloseButton} onPress={() => setSearchOpen(false)}>
                <Ionicons name="close" size={18} color={colors.textPrimary} />
              </Pressable>
            </View>
            <View style={styles.searchModalBody}>
              <Text style={[styles.searchModalDescription, { color: colors.textPrimary }]}>
                검색 화면입니다.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 0,
    zIndex: 20
  },
  mobileCollapseButton: {
    height: 36,
    width: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8
  },
  mobileCollapseButtonIconOpen: {
    transform: [{ rotate: '180deg' }]
  },
  mobileCollapseButtonIconPlaceholder: {
    width: 16,
    height: 16
  },
  brandButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10
  },
  brandButtonSelected: {
    borderWidth: 1,
    borderColor: '#cbd5e1'
  },
  brandIcon: {
    width: '100%',
    height: '100%'
  },
  item: {
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8
  },
  text: {
    fontSize: 16,
    fontWeight: '600'
  },
  settingsWrap: {
    position: 'relative',
    marginLeft: 8,
    zIndex: 40
  },
  searchTrigger: {
    height: 36,
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    marginRight: 8
  },
  searchPlaceholder: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500'
  },
  downloadButton: {
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    paddingLeft: 12,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8
  },
  downloadButtonText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600'
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  profileButton: {
    marginLeft: 8
  },
  settingsMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1000
  },
  menuItem: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  menuRowWrap: {
    position: 'relative'
  },
  menuColorTitle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuColorIcons: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  menuColorIcon: {
    marginRight: 2
  },
  colorOptionLabel: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorOptionIcons: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  colorOptionIcon: {
    marginRight: 2
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '500'
  },
  submenu: {
    position: 'absolute',
    top: 0,
    right: '100%',
    marginRight: 8,
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 10,
    padding: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    zIndex: 1100
  },
  submenuItem: {
    minHeight: 34,
    paddingHorizontal: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchModalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f172a66'
  },
  searchModalCard: {
    width: '92%',
    maxWidth: 560,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 }
  },
  searchModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchModalTitle: {
    fontSize: 18,
    fontWeight: '700'
  },
  searchCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center'
  },
  searchModalBody: {
    paddingTop: 16,
    paddingBottom: 4
  },
  searchModalDescription: {
    fontSize: 14
  }
});
