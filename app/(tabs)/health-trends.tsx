import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Card, BtnPrimary } from '@/components/ui/MediComponents';

const bars = [55, 64, 50, 76, 92];
const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

const vitalTrends = [
  { name: 'Blood pressure', trend: 'Stable', color: Colors.emerald[500] },
  { name: 'Heart rate', trend: 'Improving', color: Colors.emerald[500] },
  { name: 'Cholesterol', trend: 'Watch', color: Colors.amber[500] },
];

export default function HealthTrendsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Health Trends</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text style={styles.headerRight}>3 months ▾</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: Colors.emerald[500] }]}>↓ 2 pts</Text>
            <Text style={styles.summaryLabel}>BP this month</Text>
          </Card>
          <Card style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: Colors.amber[500] }]}>↑ 4 pts</Text>
            <Text style={styles.summaryLabel}>Glucose trend</Text>
          </Card>
        </View>

        {/* Bar chart */}
        <Card style={styles.chartCard}>
          <Text style={styles.chartTitle}>Glucose history — last 5 months</Text>
          <View style={styles.barRow}>
            {bars.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: (h / 100) * 80,
                      backgroundColor: i === 4 ? Colors.cloud[500] : i === 3 ? Colors.cloud[400] : Colors.cloud[200],
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: i === 4 ? Colors.cloud[500] : Colors.gray[400] }]}>{months[i]}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* AI insight */}
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 AI insight</Text>
          <Text style={styles.aiText}>Glucose gradually rising over 2 months. Reduce sugar intake and consult your doctor at your next visit.</Text>
        </Card>

        {/* Vitals over time */}
        <Card style={styles.vitalsCard}>
          <Text style={styles.vitalsTitle}>All vitals over time</Text>
          {vitalTrends.map((v) => (
            <View key={v.name} style={styles.vitalRow}>
              <Text style={styles.vitalName}>{v.name}</Text>
              <Text style={[styles.vitalTrend, { color: v.color }]}>{v.trend}</Text>
            </View>
          ))}
        </Card>

        <BtnPrimary onPress={() => router.push('/enter-vitals')}>Run health prediction</BtnPrimary>
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
  headerRight: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  summaryRow: { flexDirection: 'row', gap: 12 },
  summaryCard: { flex: 1, padding: 14, gap: 4 },
  summaryVal: { fontSize: 18, fontWeight: '700' },
  summaryLabel: { fontSize: 10, color: Colors.gray[400] },
  chartCard: { padding: 16 },
  chartTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray[700], marginBottom: 16 },
  barRow: { flexDirection: 'row', alignItems: 'flex-end', height: 100, gap: 8 },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6 },
  bar: { width: '80%', borderRadius: 6, minHeight: 4 },
  barLabel: { fontSize: 9, fontWeight: '700' },
  aiCard: { backgroundColor: Colors.cloud[50], borderColor: Colors.cloud[200], padding: 16, gap: 6 },
  aiTitle: { fontSize: 11, fontWeight: '700', color: Colors.cloud[700] },
  aiText: { fontSize: 11, color: Colors.cloud[700], lineHeight: 17 },
  vitalsCard: { padding: 16 },
  vitalsTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray[700], marginBottom: 10 },
  vitalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.cloud[50] },
  vitalName: { fontSize: 11, color: Colors.gray[600] },
  vitalTrend: { fontSize: 11, fontWeight: '700' },
});
