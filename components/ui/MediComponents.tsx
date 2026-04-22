import { Colors, Gradients } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    StyleProp,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle
} from 'react-native';

// ─── Eye Icons (for password visibility toggle) ────────────────────────────────
export const EyeIcon = ({ size = 20, color = Colors.gray[500] }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: size * 0.8, color }}>👁</Text>
  </View>
);

export const EyeOffIcon = ({ size = 20, color = Colors.gray[500] }: { size?: number; color?: string }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ fontSize: size * 0.8, color }}>👁‍🗨</Text>
  </View>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeType = 'blue' | 'green' | 'yellow' | 'red' | 'gray';
const badgeStyles: Record<BadgeType, { bg: string; text: string; border: string }> = {
  blue:   { bg: Colors.cloud[50],   text: Colors.cloud[700],   border: Colors.cloud[200] },
  green:  { bg: Colors.emerald[50], text: Colors.emerald[700], border: Colors.emerald[200] },
  yellow: { bg: Colors.amber[50],   text: Colors.amber[700],   border: Colors.amber[200] },
  red:    { bg: Colors.red[50],     text: Colors.red[600],     border: Colors.red[200] },
  gray:   { bg: Colors.gray[100],   text: Colors.gray[600],    border: Colors.gray[200] },
};
export const Badge = ({ label, type = 'blue' }: { label: string; type?: BadgeType }) => {
  const s = badgeStyles[type];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg, borderColor: s.border }]}>
      <Text style={[styles.badgeText, { color: s.text }]}>{label}</Text>
    </View>
  );
};

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.card, style]}>{children}</View>
);

// ─── GradientButton ───────────────────────────────────────────────────────────
export const BtnPrimary = ({
  children, onPress, style,
}: { children: React.ReactNode; onPress?: () => void; style?: ViewStyle }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={[styles.btnPrimary, style]}>
    <LinearGradient colors={Gradients.default} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btnPrimaryGrad}>
      <Text style={styles.btnPrimaryText}>{children}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

export const BtnSecondary = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.btnSecondary}>
    <Text style={styles.btnSecondaryText}>{children}</Text>
  </TouchableOpacity>
);

export const BtnOutline = ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.btnOutline}>
    <Text style={styles.btnOutlineText}>{children}</Text>
  </TouchableOpacity>
);

// ─── InputField ───────────────────────────────────────────────────────────────
interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
export const InputField = ({ label, icon, rightIcon, ...props }: InputFieldProps) => (
  <View style={styles.fieldWrap}>
    {label && <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>}
    <View style={styles.fieldInputContainer}>
      {icon && <View style={styles.fieldIcon}>{icon}</View>}
      <TextInput
        style={[styles.fieldInput, icon && { marginLeft: 36 }]}
        placeholderTextColor={Colors.gray[400]}
        {...props}
      />
      {rightIcon && <View style={styles.fieldRightIcon}>{rightIcon}</View>}
    </View>
  </View>
);

// ─── SelectField (fake select for RN) ────────────────────────────────────────
export const SelectDisplay = ({
  label, value, options, onChange,
}: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label.toUpperCase()}</Text>
      <TouchableOpacity style={styles.fieldInput} onPress={() => setOpen(!open)} activeOpacity={0.8}>
        <Text style={{ fontSize: 12, color: Colors.gray[800], fontWeight: '500' }}>{value} ▾</Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdown}>
          {options.map((o) => (
            <TouchableOpacity key={o} style={styles.dropdownItem} onPress={() => { onChange(o); setOpen(false); }}>
              <Text style={{ fontSize: 12, color: Colors.gray[700] }}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Toggle ───────────────────────────────────────────────────────────────────
export const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
  <TouchableOpacity onPress={onToggle} activeOpacity={0.8}
    style={[styles.toggleTrack, { backgroundColor: on ? Colors.cloud[500] : Colors.gray[300] }]}>
    <View style={[styles.toggleThumb, on && { marginLeft: 'auto' as any }]} />
  </TouchableOpacity>
);

// ─── TopBar ───────────────────────────────────────────────────────────────────
export const TopBar = ({
  title, onBack, rightLabel, onRight,
}: { title: string; onBack?: () => void; rightLabel?: string; onRight?: () => void }) => (
  <View style={styles.topBar}>
    <View style={{ width: 72 }}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.topBarBack}>
          <Text style={styles.topBarBackText}>‹</Text>
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.topBarTitle}>{title}</Text>
    <View style={{ width: 72, alignItems: 'flex-end' }}>
      {rightLabel && (
        <TouchableOpacity onPress={onRight}>
          <Text style={styles.topBarRight}>{rightLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// ─── Section Divider ──────────────────────────────────────────────────────────
export const Divider = ({ style }: { style?: ViewStyle }) => (
  <View style={[{ height: 1, backgroundColor: Colors.cloud[100] }, style]} />
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 9, fontWeight: '700' },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.cloud[100],
    shadowColor: Colors.cloud[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },

  btnPrimary: { borderRadius: 99, overflow: 'hidden' },
  btnPrimaryGrad: { paddingVertical: 14, alignItems: 'center', borderRadius: 99 },
  btnPrimaryText: { color: Colors.white, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  btnSecondary: {
    borderRadius: 99, paddingVertical: 14, alignItems: 'center',
    backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200],
  },
  btnSecondaryText: { color: Colors.cloud[600], fontSize: 12, fontWeight: '700' },

  btnOutline: {
    borderRadius: 99, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.cloud[300],
  },
  btnOutlineText: { color: Colors.cloud[500], fontSize: 12, fontWeight: '600' },

  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[500], letterSpacing: 1 },
  fieldInputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cloud[50],
    borderWidth: 1,
    borderColor: Colors.cloud[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldIcon: {
    position: 'absolute',
    left: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldRightIcon: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.gray[800],
    fontWeight: '400',
    padding: 0,
    marginLeft: 32,
  },

  dropdown: {
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200],
    borderRadius: 12, marginTop: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8,
    elevation: 4, zIndex: 999,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cloud[50] },

  toggleTrack: { width: 44, height: 24, borderRadius: 12, padding: 2, flexDirection: 'row', alignItems: 'center' },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },

  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 12, backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.cloud[100],
  },
  topBarBack: { width: 32, height: 32, borderRadius: 12, backgroundColor: Colors.cloud[50], alignItems: 'center', justifyContent: 'center' },
  topBarBackText: { fontSize: 22, color: Colors.cloud[500], lineHeight: 26 },
  topBarTitle: { fontSize: 14, fontWeight: '600', color: Colors.gray[800] },
  topBarRight: { fontSize: 12, fontWeight: '700', color: Colors.cloud[500] },
});
