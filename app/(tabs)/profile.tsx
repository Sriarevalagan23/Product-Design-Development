import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card, BtnSecondary, BtnOutline } from '@/components/ui/MediComponents';

const info = [
  { l: 'Date of birth',      v: '12 Jan 2003' },
  { l: 'Blood group',        v: 'O+' },
  { l: 'Height / Weight',    v: '170 cm / 65 kg' },
  { l: 'Allergies',          v: 'Penicillin' },
  { l: 'Emergency contact',  v: '+91 98765 43210' },
];

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.push('/edit-profile')} activeOpacity={0.7}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <Card style={styles.avatarCard}>
          <LinearGradient colors={['#0a7aff', '#3a9bff']} style={styles.avatar}>
            <Text style={styles.avatarText}>SR</Text>
          </LinearGradient>
          <Text style={styles.name}>Srinidhi R</Text>
          <Text style={styles.email}>srinidhi@email.com</Text>
          <Badge label="Patient" type="blue" />
        </Card>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionLabel}>PERSONAL INFO</Text>
          {info.map(({ l, v }) => (
            <View key={l} style={styles.infoRow}>
              <Text style={styles.infoKey}>{l}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
        </Card>

        <BtnSecondary onPress={() => {}}>Download my records</BtnSecondary>
        <BtnOutline onPress={() => router.push('/about')}>About & help</BtnOutline>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/settings')} activeOpacity={0.8}>
          <Text style={styles.settingsBtnText}>Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cloud[100],
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.gray[800] },
  editText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  avatarCard: { padding: 24, alignItems: 'center', gap: 8 },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.gray[800] },
  email: { fontSize: 11, color: Colors.gray[400] },
  infoCard: { padding: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 2, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cloud[50] },
  infoKey: { fontSize: 11, color: Colors.gray[500] },
  infoVal: { fontSize: 11, fontWeight: '700', color: Colors.gray[800] },
  settingsBtn: { borderRadius: 99, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.gray[200] },
  settingsBtnText: { fontSize: 13, fontWeight: '600', color: Colors.gray[600] },
});
