import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, BtnPrimary, Card, TopBar } from '@/components/ui/MediComponents';

export default function ChangePasswordScreen() {
  const [form, setForm] = useState({ curr: '', newp: '', conf: '' });
  const f = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  const checks = [
    { label: 'At least 8 characters', pass: form.newp.length >= 8 },
    { label: 'One uppercase letter',  pass: /[A-Z]/.test(form.newp) },
    { label: 'One number',            pass: /[0-9]/.test(form.newp) },
  ];

  return (
    <View style={styles.container}>
      <TopBar title="Change password" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <InputField label="Current password" placeholder="••••••••" value={form.curr} onChangeText={f('curr')} secureTextEntry />
        <InputField label="New password"     placeholder="••••••••" value={form.newp} onChangeText={f('newp')} secureTextEntry />
        <InputField label="Confirm new password" placeholder="••••••••" value={form.conf} onChangeText={f('conf')} secureTextEntry />

        <Card style={styles.reqCard}>
          <Text style={styles.reqTitle}>Requirements</Text>
          {checks.map((c) => (
            <View key={c.label} style={styles.reqRow}>
              <View style={[styles.reqDot, { backgroundColor: c.pass ? Colors.emerald[400] : Colors.gray[200] }]} />
              <Text style={[styles.reqText, { color: c.pass ? Colors.emerald[500] : Colors.gray[400] }]}>{c.label}</Text>
            </View>
          ))}
        </Card>

        <BtnPrimary onPress={() => router.back()}>Update password</BtnPrimary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 16, paddingBottom: 40 },
  reqCard: { padding: 14, gap: 2 },
  reqTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[600], marginBottom: 8 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5 },
  reqDot: { width: 8, height: 8, borderRadius: 4 },
  reqText: { fontSize: 12 },
});
