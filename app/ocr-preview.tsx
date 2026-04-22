import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Card, BtnPrimary, BtnOutline, TopBar } from '@/components/ui/MediComponents';

export default function OcrPreviewScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Extracted text" onBack={() => router.back()} rightLabel="Edit" onRight={() => {}} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Success banner */}
        <View style={styles.successBanner}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successText}>Text extracted successfully</Text>
        </View>

        {/* OCR content */}
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Extracted content</Text>
          <View style={styles.mono}>
            <Text style={styles.monoText}>
              {'Patient: Srinidhi R\nDate: 15/03/2026\nTest: CBC\nHb: 14.2 g/dL  ✓\nWBC: 7200 /μL  ✓\nPlatelets: 2.1 L/μL  ✓'}
            </Text>
          </View>
        </Card>

        {/* AI explanation */}
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 AI explanation</Text>
          <Text style={styles.aiText}>All values are normal. No anaemia or infection detected. Blood health is in great shape.</Text>
        </Card>

        <BtnPrimary onPress={() => router.push('/(tabs)/reports')}>Save to records</BtnPrimary>
        <BtnOutline onPress={() => router.push('/scan-doc')}>Discard</BtnOutline>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.emerald[50], borderWidth: 1, borderColor: Colors.emerald[200],
    borderRadius: 14, padding: 12,
  },
  successIcon: { fontSize: 16 },
  successText: { fontSize: 13, fontWeight: '700', color: Colors.emerald[700] },
  card: { padding: 16 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[700], marginBottom: 12 },
  mono: { backgroundColor: Colors.cloud[50], borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.cloud[100] },
  monoText: { fontFamily: 'monospace', fontSize: 12, color: Colors.gray[700], lineHeight: 22 },
  aiCard: { backgroundColor: Colors.cloud[50], borderColor: Colors.cloud[200], padding: 16, gap: 6 },
  aiTitle: { fontSize: 11, fontWeight: '700', color: Colors.cloud[700] },
  aiText: { fontSize: 11, color: Colors.cloud[700], lineHeight: 17 },
});
