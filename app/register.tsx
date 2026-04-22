import { BtnPrimary, InputField } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Convert DD/MM/YYYY → YYYY-MM-DD for Supabase (date column)
function parseDob(raw: string): string | null {
  const parts = raw.replace(/\s/g, '').split('/');
  if (parts.length !== 3) return null;
  const [dd, mm, yyyy] = parts;
  if (dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return null;
  return `${yyyy}-${mm}-${dd}`;
}

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', pass: '', dob: '', blood: '' });
  const [showPass, setShowPass] = useState(false);
  const [bloodModal, setBloodModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const f = (k: string) => (v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleRegister = async () => {
    const { name, email, pass, dob, blood } = form;

    if (!name || !email || !pass) {
      Alert.alert('Missing fields', 'Please fill in name, email and password.');
      return;
    }
    if (pass.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    const dobFormatted = dob ? parseDob(dob) : null;
    if (dob && !dobFormatted) {
      Alert.alert('Invalid date', 'Please enter date as DD / MM / YYYY.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          full_name: name,
          dob: dobFormatted,       // stored in profiles.dob via trigger
          blood_group: blood || null,
        },
      },
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
    } else {
      Alert.alert(
        '✉️ Check your email',
        'We sent a confirmation link to ' + email + '. Click it to activate your account, then sign in.',
        [{ text: 'Go to Sign in', onPress: () => router.replace('/login') }],
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={20} color={Colors.gray[700]} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo + Brand */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="heart" size={32} color="#fff" />
            </View>
            <Text style={styles.brandName}>Medex</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Start your journey</Text>
            <Text style={styles.subtitle}>Your health records, secured</Text>
          </View>

          {/* Fields */}
          <View style={styles.form}>
            {/* Full name */}
            <InputField
              placeholder="Full name"
              value={form.name}
              onChangeText={f('name')}
              autoCapitalize="words"
              icon={<Ionicons name="person-outline" size={18} color={Colors.cloud[500]} />}
            />

            {/* Email */}
            <InputField
              placeholder="Email address"
              value={form.email}
              onChangeText={f('email')}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Ionicons name="mail-outline" size={18} color={Colors.cloud[500]} />}
            />

            {/* Password */}
            <InputField
              placeholder="Password"
              value={form.pass}
              onChangeText={f('pass')}
              secureTextEntry={!showPass}
              icon={<Ionicons name="lock-closed-outline" size={18} color={Colors.cloud[500]} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  <Ionicons
                    name={showPass ? 'eye' : 'eye-off'}
                    size={18}
                    color={Colors.gray[400]}
                  />
                </TouchableOpacity>
              }
            />

            {/* Date of birth */}
            <InputField
              placeholder="DD / MM / YYYY"
              value={form.dob}
              onChangeText={f('dob')}
              keyboardType="numeric"
              icon={<Ionicons name="calendar-outline" size={18} color={Colors.cloud[500]} />}
            />

            {/* Blood group picker */}
            <TouchableOpacity
              style={styles.pickerRow}
              onPress={() => setBloodModal(true)}
              activeOpacity={0.8}
            >
              <View style={styles.pickerIcon}>
                <Ionicons name="water-outline" size={18} color={Colors.cloud[500]} />
              </View>
              <View style={styles.pickerText}>
                <Text style={styles.pickerLabel}>Blood group</Text>
                <Text style={[styles.pickerValue, !form.blood && { color: Colors.gray[400] }]}>
                  {form.blood || 'Select blood group'}
                </Text>
              </View>
              <Ionicons name="chevron-down" size={16} color={Colors.gray[400]} />
            </TouchableOpacity>
          </View>

          {/* CTA */}
          <BtnPrimary onPress={handleRegister}>
            {loading ? 'Creating account…' : 'Create account  →'}
          </BtnPrimary>

          {/* Sign in hint */}
          <Text style={styles.hint}>
            Have an account?{'  '}
            <Text style={styles.hintLink} onPress={() => router.push('/login')}>
              Sign in
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Blood group modal */}
      <Modal visible={bloodModal} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setBloodModal(false)} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Select blood group</Text>
          {BLOOD_GROUPS.map((bg) => (
            <TouchableOpacity
              key={bg}
              style={[styles.modalItem, form.blood === bg && styles.modalItemActive]}
              onPress={() => { f('blood')(bg); setBloodModal(false); }}
            >
              <Text style={[styles.modalItemText, form.blood === bg && styles.modalItemTextActive]}>
                {bg}
              </Text>
              {form.blood === bg && (
                <Ionicons name="checkmark" size={16} color={Colors.cloud[500]} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },

  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.cloud[50],
    borderWidth: 1,
    borderColor: Colors.cloud[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
    gap: 24,
  },

  logoWrap: { alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: Colors.cloud[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.cloud[500],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.cloud[500],
    letterSpacing: -0.3,
  },

  header: { alignItems: 'center', gap: 6 },
  title: { fontSize: 24, fontWeight: '700', color: '#1a1a2e', textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.gray[400], textAlign: 'center' },

  form: { gap: 12 },

  /* Blood group row */
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cloud[50],
    borderWidth: 1,
    borderColor: Colors.cloud[100],
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  pickerIcon: { width: 24, alignItems: 'center' },
  pickerText: { flex: 1 },
  pickerLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray[500], marginBottom: 2 },
  pickerValue: { fontSize: 15, color: Colors.gray[800], fontWeight: '500' },

  hint: { textAlign: 'center', fontSize: 14, color: Colors.gray[500] },
  hintLink: { color: Colors.cloud[500], fontWeight: '700' },

  /* Modal */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  modalSheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 4,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.cloud[100],
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.gray[700],
    marginBottom: 8,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  modalItemActive: { backgroundColor: Colors.cloud[50] },
  modalItemText: { fontSize: 15, color: Colors.gray[700], fontWeight: '500' },
  modalItemTextActive: { color: Colors.cloud[500], fontWeight: '700' },
});
