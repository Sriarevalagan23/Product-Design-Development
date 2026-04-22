import { Card, Toggle, TopBar } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [toggles, setToggles] = useState({ notifs: true, reminders: true, dark: false, bio: true });
  const t = (k: keyof typeof toggles) => () => setToggles((p) => ({ ...p, [k]: !p[k] }));
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: Colors.white }} />
      <TopBar title="Settings" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Preferences */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>PREFERENCES</Text>
          {[
            { label: 'Push notifications', key: 'notifs' as const },
            { label: 'Health reminders', key: 'reminders' as const },
            { label: 'Dark mode', key: 'dark' as const },
          ].map(({ label, key }) => (
            <View key={key} style={styles.row}>
              <Text style={styles.rowLabel}>{label}</Text>
              <Toggle on={toggles[key]} onToggle={t(key)} />
            </View>
          ))}
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Voice language</Text>
            <Text style={styles.rowRight}>English (IN) ›</Text>
          </View>
        </Card>

        {/* Security */}
        <Card style={styles.card}>
          <Text style={styles.sectionLabel}>SECURITY</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Biometric lock</Text>
            <Toggle on={toggles.bio} onToggle={t('bio')} />
          </View>
          <TouchableOpacity style={styles.row} onPress={() => router.push('/change-password')} activeOpacity={0.8}>
            <Text style={styles.rowLabel}>Change password</Text>
            <Text style={styles.rowRight}>›</Text>
          </TouchableOpacity>
        </Card>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOut} onPress={() => router.replace('/login')} activeOpacity={0.85}>

          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16 },
  sectionLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 2, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.cloud[50] },
  rowLabel: { fontSize: 14, color: Colors.gray[700] },
  rowRight: { fontSize: 14, color: Colors.gray[400] },
  signOut: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    paddingVertical: 16, backgroundColor: Colors.red[50], borderWidth: 1, borderColor: Colors.red[200],
    borderRadius: 20,
  },
  signOutIcon: { fontSize: 18 },
  signOutText: { fontSize: 14, fontWeight: '700', color: Colors.red[600] },
});
