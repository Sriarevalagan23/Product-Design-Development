import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar } from '@/components/ui/MediComponents';

export default function RegisterScreen() {
  const [form, setForm] = useState({ name: '', email: '', pass: '', dob: '', blood: 'Select blood group' });
  const f = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  return (
    <View style={styles.container}>
      <TopBar title="Create account" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Start your journey</Text>
          <Text style={styles.subtitle}>Your health records, secured</Text>
        </View>

        <InputField label="Full name" placeholder="Srinidhi R" value={form.name} onChangeText={f('name')} />
        <InputField label="Email" placeholder="you@email.com" value={form.email} onChangeText={f('email')} keyboardType="email-address" autoCapitalize="none" />
        <InputField label="Password" placeholder="••••••••" value={form.pass} onChangeText={f('pass')} secureTextEntry />
        <InputField label="Date of birth" placeholder="DD / MM / YYYY" value={form.dob} onChangeText={f('dob')} />
        <SelectDisplay
          label="Blood group"
          value={form.blood}
          onChange={f('blood')}
          options={['Select blood group', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
        />

        <BtnPrimary onPress={() => router.replace('/(tabs)')}>Create account</BtnPrimary>

        <Text style={styles.hint}>
          Have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/login')}>Sign in</Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 },
  header: { gap: 4, marginBottom: 4 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray[800] },
  subtitle: { fontSize: 13, color: Colors.gray[500] },
  hint: { textAlign: 'center', fontSize: 13, color: Colors.gray[500] },
  link: { color: Colors.cloud[500], fontWeight: '700' },
});
