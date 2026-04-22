import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Card, TopBar } from '@/components/ui/MediComponents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const items = [
  { title: 'Report ready',       desc: 'Blood test results uploaded successfully.',                              time: '2 min ago',   dot: Colors.cloud[500],   bg: Colors.cloud[50] },
  { title: 'Health alert',       desc: 'Glucose above normal range. Consider reducing sugar intake.',           time: '1 hour ago',  dot: Colors.amber[400],   bg: Colors.amber[50] },
  { title: 'AI insight ready',   desc: 'New health trend analysis available for your review.',                  time: '3 hours ago', dot: Colors.emerald[500], bg: Colors.white },
  { title: 'Monthly reminder',   desc: 'Time for your routine health check-up.',                               time: 'Yesterday',   dot: Colors.gray[400],    bg: Colors.white },
];

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ height: insets.top, backgroundColor: Colors.white }} />
      <TopBar
        title="Notifications"
        onBack={() => router.back()}
        rightLabel="Mark all read"
        onRight={() => {}}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {items.map((it, i) => (
          <Card key={i} style={[styles.card, { backgroundColor: it.bg }]}>
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: it.dot }]} />
              <View style={styles.info}>
                <Text style={styles.title}>{it.title}</Text>
                <Text style={styles.desc}>{it.desc}</Text>
                <Text style={styles.time}>{it.time}</Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 10, paddingBottom: 32 },
  card: { padding: 14 },
  row: { flexDirection: 'row', gap: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
  info: { flex: 1, gap: 4 },
  title: { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  desc: { fontSize: 11, color: Colors.gray[500], lineHeight: 16 },
  time: { fontSize: 10, color: Colors.gray[400], marginTop: 4 },
});
