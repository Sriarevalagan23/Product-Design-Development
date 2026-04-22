import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, SelectDisplay, BtnPrimary, TopBar } from '@/components/ui/MediComponents';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', blood: '', height: '', weight: '', allergies: '',
  });
  const f = (k: string) => (v: string) => setForm({ ...form, [k]: v });

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setForm(prev => ({
            ...prev,
            name: data.full_name || '',
            phone: data.phone || '',
            blood: data.blood_group || '',
            height: data.height ? data.height.toString() : '',
            weight: data.weight ? data.weight.toString() : '',
            allergies: data.allergies || '',
          }));
        }
      }
    }
    loadProfile();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('profiles').update({
        full_name: form.name,
        phone: form.phone,
        blood_group: form.blood,
        height: form.height ? parseFloat(form.height) : null,
        weight: form.weight ? parseFloat(form.weight) : null,
        allergies: form.allergies,
      }).eq('id', user.id);
      
      if (error) Alert.alert('Error', error.message);
      else router.back();
    }
    setLoading(false);
  };

  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: Colors.white }} />
      <TopBar title="Edit profile" onBack={() => router.back()} rightLabel="Save" onRight={handleSave} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <LinearGradient colors={['#0a7aff', '#3a9bff']} style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(form.name)}</Text>
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

        <BtnPrimary onPress={handleSave}>
          {loading ? 'Saving...' : 'Save changes'}
        </BtnPrimary>
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
