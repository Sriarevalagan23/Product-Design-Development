import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card, BtnSecondary, BtnOutline, TopBar } from '@/components/ui/MediComponents';

const markers = [
  { name: 'Haemoglobin', val: '14.2 g/dL', pct: 80, ok: true },
  { name: 'WBC count',   val: '7,200 /μL',  pct: 72, ok: true },
  { name: 'Platelets',   val: '2.1 L/μL',   pct: 66, ok: true },
  { name: 'RBC',         val: '4.8 M/μL',   pct: 78, ok: true },
];

export default function ReportDetailScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Report detail" onBack={() => router.back()} rightLabel="Share" onRight={() => {}} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Markers card */}
        <Card style={styles.card}>
          <View style={styles.reportHeader}>
            <View>
              <Text style={styles.reportName}>Blood test — CBC</Text>
              <Text style={styles.reportMeta}>Apollo Hospital · 15 Mar 2026</Text>
            </View>
            <Badge label="Normal" type="green" />
          </View>
          <View style={styles.divider} />
          {markers.map((m) => (
            <View key={m.name} style={styles.markerRow}>
              <Text style={styles.markerName}>{m.name}</Text>
              <View style={styles.markerRight}>
                <View style={styles.progressBg}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${m.pct}%` as any, backgroundColor: m.ok ? Colors.emerald[400] : Colors.amber[400] },
                    ]}
                  />
                </View>
                <Text style={styles.markerVal}>{m.val}</Text>
              </View>
            </View>
          ))}
        </Card>

        {/* AI Explanation */}
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 AI explanation</Text>
          <Text style={styles.aiText}>All values are within healthy range. No anaemia detected — haemoglobin is strong at 14.2 g/dL. WBC is normal, suggesting no active infection.</Text>
        </Card>

        <BtnOutline onPress={() => {}}>View original PDF</BtnOutline>
        <BtnSecondary onPress={() => router.push('/voice-chat')}>Ask AI about this report</BtnSecondary>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  reportName: { fontSize: 15, fontWeight: '700', color: Colors.gray[800] },
  reportMeta: { fontSize: 10, color: Colors.gray[400], marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.cloud[100], marginBottom: 10 },
  markerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  markerName: { fontSize: 11, color: Colors.gray[500], width: 110 },
  markerRight: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  progressBg: { flex: 1, height: 6, backgroundColor: Colors.emerald[50], borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  markerVal: { fontSize: 11, fontWeight: '700', color: Colors.gray[800], width: 88, textAlign: 'right' },
  aiCard: { backgroundColor: Colors.cloud[50], borderColor: Colors.cloud[200], padding: 16, gap: 6 },
  aiTitle: { fontSize: 11, fontWeight: '700', color: Colors.cloud[700] },
  aiText: { fontSize: 11, color: Colors.cloud[700], lineHeight: 17 },
});
