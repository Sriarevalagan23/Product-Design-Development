import { Card, TopBar } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const helpItems = [
  'How to use the app',
  'Privacy policy',
  'Data security & DISHA',
  'Contact support',
  'FAQ',
];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: Colors.white }} />
      <TopBar title="About & help" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Logo card */}
        <Card style={styles.logoCard}>
          <View style={styles.logoWrap}>
          </View>
          <Text style={styles.appName}>Medex</Text>
          <Text style={styles.version}>Version 1.0.0 · Academic project 2026</Text>
        </Card>

        {/* Help links */}
        <Card>
          {helpItems.map((item, i) => (
            <TouchableOpacity key={item} style={[styles.helpRow, i > 0 && styles.borderTop]} activeOpacity={0.8}>
              <Text style={styles.helpText}>{item}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>

        <Text style={styles.footer}>Built with care · Final year project 2026</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  logoCard: { padding: 24, alignItems: 'center', gap: 8 },
  logoWrap: {
    width: 64, height: 64, borderRadius: 20, backgroundColor: Colors.cloud[50],
    borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center',
  },
  appName: { fontSize: 20, fontWeight: '700', color: Colors.gray[800] },
  version: { fontSize: 10, color: Colors.gray[400], textAlign: 'center' },
  helpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.cloud[50] },
  helpText: { fontSize: 14, color: Colors.gray[700] },
  chevron: { fontSize: 20, color: Colors.gray[400] },
  footer: { textAlign: 'center', fontSize: 11, color: Colors.gray[400] },
});
