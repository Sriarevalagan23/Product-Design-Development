import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card } from '@/components/ui/MediComponents';
import { getUserDocuments, UserDocument } from '@/lib/documents';
import { supabase } from '@/lib/supabase';

const filters = ['All', 'Blood Test', 'General Medical', 'ECG', 'X-ray / Scan', 'Prescription', 'Other'];

export default function ReportsScreen() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function loadReports() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const docs = await getUserDocuments(user.id);
            setReports(docs);
          }
        } catch (error) {
          console.error("Failed to load reports:", error);
        } finally {
          setLoading(false);
        }
      }
      loadReports();
    }, [])
  );

  const shown = reports.filter(
    (r) =>
      (filter === 'All' || r.report_category?.includes(filter)) &&
      r.report_name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatSubtitle = (r: UserDocument) => {
    let parts = [];
    if (r.report_date) parts.push(r.report_date);
    if (r.hospital_name) parts.push(r.hospital_name);
    return parts.join(' · ') || 'Recently uploaded';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Reports</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/upload')} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports…"
            placeholderTextColor={Colors.gray[400]}
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f ? styles.filterActive : styles.filterInactive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, { color: filter === f ? Colors.white : Colors.gray[600] }]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* List */}
        <Card>
          {loading ? (
            <View style={styles.empty}>
              <ActivityIndicator size="small" color={Colors.cloud[500]} />
            </View>
          ) : shown.length > 0 ? (
            shown.map((r, i) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.reportRow, i > 0 && styles.borderTop]}
                onPress={() => router.push(`/report-detail?id=${r.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.reportIcon}><Text>📄</Text></View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportName}>{r.report_name}</Text>
                  <Text style={styles.reportDate}>{formatSubtitle(r)}</Text>
                </View>
                <Badge label="Saved" type="blue" />
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No reports found</Text>
            </View>
          )}
        </Card>

        {/* Scan */}
        <TouchableOpacity style={styles.scanBtn} onPress={() => router.push('/scan-doc')} activeOpacity={0.8}>
          <Text>📷</Text>
          <Text style={styles.scanText}>Scan document</Text>
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
  addBtn: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.cloud[500], alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: Colors.white, fontSize: 18, fontWeight: '300', lineHeight: 22 },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200], borderRadius: 99, paddingHorizontal: 14, paddingVertical: 10 },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.gray[700] },
  filterRow: { gap: 8, paddingVertical: 2 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 99, borderWidth: 1 },
  filterActive: { backgroundColor: Colors.cloud[500], borderColor: Colors.cloud[500] },
  filterInactive: { backgroundColor: Colors.white, borderColor: Colors.cloud[200] },
  filterText: { fontSize: 11, fontWeight: '700' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.cloud[50] },
  reportIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 11, fontWeight: '700', color: Colors.gray[800] },
  reportDate: { fontSize: 10, color: Colors.gray[400], marginTop: 2 },
  empty: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 13, color: Colors.gray[400] },
  scanBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderWidth: 2, borderStyle: 'dashed', borderColor: Colors.cloud[300], borderRadius: 20, backgroundColor: Colors.cloud[50] },
  scanText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
});
