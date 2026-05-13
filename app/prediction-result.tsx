import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card, BtnPrimary, BtnSecondary, BtnOutline, TopBar } from '@/components/ui/MediComponents';

const factors = [
  { name: 'Blood pressure', badge: 'Normal', type: 'green' as const },
  { name: 'Glucose level', badge: 'Borderline', type: 'yellow' as const },
  { name: 'BMI', badge: 'Healthy', type: 'green' as const },
  { name: 'Cholesterol', badge: 'Normal', type: 'green' as const },
  { name: 'Smoking', badge: 'No risk', type: 'green' as const },
];

export default function PredictionResultScreen() {
  return (
    <View style={styles.container}>
      <TopBar title="Risk result" onBack={() => router.back()} />
      <View style={styles.inner}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Risk badge */}
          <View style={styles.resultBanner}>
            <View style={styles.resultCircle}>
              <Text style={styles.resultCheck}>✓</Text>
            </View>
            <Text style={styles.resultTitle}>Low risk detected</Text>
            <Text style={styles.resultDesc}>Your vitals show low risk of chronic disease. Keep up your current habits!</Text>
          </View>

          {/* Breakdown */}
          <Card style={styles.card}>
            <Text style={styles.cardTitle}>Risk factor breakdown</Text>
            {factors.map((r) => (
              <View key={r.name} style={styles.factorRow}>
                <Text style={styles.factorName}>{r.name}</Text>
                <Badge label={r.badge} type={r.type} />
              </View>
            ))}
          </Card>

          <BtnOutline onPress={() => { }}>View recommendations</BtnOutline>
          <BtnPrimary onPress={() => router.back()}>Run again with new values</BtnPrimary>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  resultBanner: {
    backgroundColor: '#E3F5C7',
    borderRadius: 20, padding: 24, alignItems: 'center', gap: 12,
  },
  resultCircle: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: Colors.cloud[500],
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
  },
  resultCheck: { fontSize: 28, color: Colors.cloud[600] },
  resultTitle: { fontSize: 20, fontWeight: '700', color: Colors.cloud[900] },
  resultDesc: { fontSize: 12, color: Colors.cloud[700], textAlign: 'center', lineHeight: 18 },
  card: { padding: 16 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: Colors.gray[700], marginBottom: 10 },
  factorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  factorName: { fontSize: 12, color: Colors.gray[600] },
});
