import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Card, TopBar } from '@/components/ui/MediComponents';

const recent = ['Blood test', 'Cholesterol', 'Apollo', 'X-ray'];
const results = [
  { name: 'Blood test — CBC', date: '15 Mar 2026', type: 'report' as const, emoji: '📄' },
  { name: 'Ask about glucose levels', date: 'AI assistant', type: 'ai' as const, emoji: '🤖' },
];

export default function SearchScreen() {
  const [q, setQ] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          autoFocus
          value={q}
          onChangeText={setQ}
          placeholder="Search reports, vitals…"
          placeholderTextColor={Colors.gray[400]}
          style={styles.searchInput}
        />
        {!!q && (
          <TouchableOpacity onPress={() => setQ('')} activeOpacity={0.7}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Recent */}
        <View>
          <Text style={styles.sectionLabel}>Recent searches</Text>
          <View style={styles.recentRow}>
            {recent.map((t) => (
              <TouchableOpacity key={t} onPress={() => setQ(t)} style={styles.recentChip} activeOpacity={0.8}>
                <Text style={styles.recentText}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Suggested */}
        <View>
          <Text style={styles.sectionLabel}>Suggested</Text>
          <Card>
            {results.map((r, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.resultRow, i > 0 && styles.borderTop]}
                onPress={() => router.push(r.type === 'ai' ? '/voice-chat' : '/report-detail')}
                activeOpacity={0.8}
              >
                <View style={styles.resultIcon}><Text>{r.emoji}</Text></View>
                <View>
                  <Text style={styles.resultName}>{r.name}</Text>
                  <Text style={styles.resultDate}>{r.date}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200],
    borderRadius: 99, margin: 16, paddingHorizontal: 16, paddingVertical: 12,
    marginTop: 56,
  },
  searchIcon: { fontSize: 15 },
  searchInput: { flex: 1, fontSize: 14, color: Colors.gray[700] },
  clearBtn: { fontSize: 15, color: Colors.gray[400] },
  scroll: { paddingHorizontal: 16, gap: 20, paddingBottom: 32 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: Colors.gray[500], marginBottom: 10 },
  recentRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  recentChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200], borderRadius: 99 },
  recentText: { fontSize: 12, fontWeight: '700', color: Colors.gray[600] },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.white },
  resultIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center' },
  resultName: { fontSize: 12, fontWeight: '700', color: Colors.gray[800] },
  resultDate: { fontSize: 10, color: Colors.gray[400], marginTop: 2 },
});
