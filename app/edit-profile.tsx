import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar } from '@/components/ui/MediComponents';

export default function EditProfileScreen() {
  const [form, setForm] = useState({
    name: 'Srinidhi R', phone: '', blood: 'O+', height: '170', weight: '65', allergies: 'Penicillin',
  });
  const f = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  return (
    <View style={styles.container}>
      <TopBar title="Edit profile" onBack={() => router.back()} rightLabel="Save" onRight={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#0a7aff', '#3a9bff']} style={styles.avatar}>
            <Text style={styles.avatarText}>SR</Text>
          </LinearGradient>
          <Text style={styles.changePhoto}>Change photo</Text>
        </View>

        <InputField label="Full name" value={form.name} onChangeText={f('name')} />
        <InputField label="Phone number" placeholder="+91 98765 43210" value={form.phone} onChangeText={f('phone')} keyboardType="phone-pad" />
        <SelectDisplay
          label="Blood group"
          value={form.blood}
          onChange={f('blood')}
          options={['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']}
        />
        <InputField label="Height (cm)" value={form.height} onChangeText={f('height')} keyboardType="numeric" />
        <InputField label="Weight (kg)" value={form.weight} onChangeText={f('weight')} keyboardType="numeric" />
        <InputField label="Allergies" value={form.allergies} onChangeText={f('allergies')} />

        <BtnPrimary onPress={() => router.back()}>Save changes</BtnPrimary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 14, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', gap: 8, paddingBottom: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  changePhoto: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
});
