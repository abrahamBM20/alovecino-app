import { StyleSheet, Platform } from 'react-native';
import { colors } from './colors';
 
export const authStyles = StyleSheet.create({
  gradient:   { flex: 1 },
  safeArea:   { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 32,
  },
 
  // Logo
  logoWrap:   { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72, height: 72,
    backgroundColor: 'rgba(26,86,219,0.25)',
    borderWidth: 2, borderColor: 'rgba(26,86,219,0.6)',
    borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 13, fontWeight: '900',
    letterSpacing: 3, color: colors.white,
  },
  logoSub: {
    fontSize: 9, fontWeight: '600',
    letterSpacing: 1.5, color: colors.textMuted,
    marginTop: 3,
  },
 
  // Titles
  screenTitle: {
    fontSize: 22, fontWeight: '800',
    color: colors.white, textAlign: 'center',
    marginBottom: 6,
  },
  screenSub: {
    fontSize: 12, color: colors.textMuted,
    textAlign: 'center', lineHeight: 18,
    marginBottom: 24, paddingHorizontal: 8,
  },
 
  // Form
  label: {
    fontSize: 10, fontWeight: '700',
    letterSpacing: 1, textTransform: 'uppercase',
    color: colors.textMuted, marginBottom: 6,
  },
  input: {
    width: '100%',
    backgroundColor: colors.inputBg,
    borderWidth: 1, borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingVertical: 13, paddingHorizontal: 16,
    fontSize: 14, color: colors.white,
    marginBottom: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(26,86,219,0.12)',
  },
 
  // Buttons
  btnPrimary: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    fontSize: 14, fontWeight: '800',
    letterSpacing: 1.2, color: colors.white,
  },
  btnOutline: {
    width: '100%',
    backgroundColor: 'transparent',
    borderWidth: 1.5, borderColor: colors.cardBorder,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  btnOutlineText: {
    fontSize: 14, fontWeight: '700', color: colors.white,
  },
  btnLink: {
    paddingVertical: 10, alignItems: 'center',
  },
  btnLinkText: {
    fontSize: 12, color: colors.textMuted,
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(255,255,255,0.2)',
  },
 
  // Divider
  dividerRow: {
    flexDirection: 'row', alignItems: 'center',
    marginVertical: 16, gap: 10,
  },
  dividerLine: {
    flex: 1, height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontSize: 11, color: colors.textMuted,
  },
 
  // Step dots
  stepDots: {
    flexDirection: 'row', justifyContent: 'center',
    gap: 6, marginBottom: 24,
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    width: 18, height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
 
  // Spacer
  spacer: { flex: 1 },
});