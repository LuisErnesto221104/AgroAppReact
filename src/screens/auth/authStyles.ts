import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';

export const AUTH_COLOR = {
  primary: COLORS.primary,
  white: COLORS.white,
  textOnLight: COLORS.black,
  secondaryText: COLORS.gray,
  error: COLORS.error,
  keyOverlay: 'rgba(255, 255, 255, 0.18)',
  keyBorder: 'rgba(255, 255, 255, 0.85)',
};

export const PIN_MIN = 4;
export const PIN_MAX = 6;

export const PIN_KEY_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', 'BORRAR'],
];

export const authStyles = StyleSheet.create({
  loaderSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: AUTH_COLOR.white,
  },
  loaderText: {
    color: AUTH_COLOR.textOnLight,
    fontSize: 14,
    fontWeight: '500',
  },
  splashSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoBadgeLight: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.primary,
    marginBottom: 12,
  },
  splashLogoFull: {
    width: 210,
    height: 106,
    marginBottom: 14,
  },
  logoBadgeDark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.white,
    marginBottom: 10,
  },
  logoBadgeText: {
    fontSize: 42,
    fontWeight: '700',
    color: AUTH_COLOR.white,
  },
  logoBadgeTextDark: {
    color: AUTH_COLOR.primary,
  },
  splashTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: AUTH_COLOR.white,
  },
  splashSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: AUTH_COLOR.white,
    textAlign: 'center',
  },
  splashBody: {
    marginTop: 20,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: AUTH_COLOR.white,
    fontFamily: FONTS.semiBold,
  },
  progressRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#d7d7d7',
  },
  progressDotActive: {
    backgroundColor: AUTH_COLOR.primary,
  },
  primaryButton: {
    marginTop: 26,
    minWidth: 210,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: AUTH_COLOR.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextLight: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
  },
  loginSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  loginLogoIcon: {
    width: 74,
    height: 74,
  },
  loginLogoText: {
    width: 176,
    height: 52,
    marginTop: 4,
  },
  loginTitle: {
    marginTop: 6,
    fontSize: 40,
    fontWeight: '800',
    color: AUTH_COLOR.white,
  },
  loginSubtitle: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: '#e7f6eb',
  },
  loginUserLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#d7eddc',
  },
  indicatorRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  indicatorDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: AUTH_COLOR.white,
    backgroundColor: 'transparent',
  },
  indicatorDotFilled: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  errorPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#f9e7e7',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    color: AUTH_COLOR.error,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  infoPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  infoText: {
    color: '#1b4b9a',
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  keypad: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  keyButton: {
    width: 95,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH_COLOR.keyBorder,
    backgroundColor: AUTH_COLOR.keyOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonZero: {
    marginRight: 0,
  },
  keyText: {
    color: AUTH_COLOR.white,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  deleteKeyText: {
    fontSize: 24,
  },
  submitButton: {
    marginTop: 20,
    minWidth: 240,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: AUTH_COLOR.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextDark: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
    textDecorationLine: 'underline',
  },
  authenticatedSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.white,
  },
  authenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authenticatedTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: AUTH_COLOR.primary,
  },
  authenticatedBody: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: AUTH_COLOR.textOnLight,
    textAlign: 'center',
  },
  authenticatedButton: {
    marginTop: 18,
  },
});
