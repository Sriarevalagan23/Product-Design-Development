import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { getUserDocuments, UserDocument } from '@/lib/documents';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const THUMB_SIZE = (SCREEN_W - 16 * 2 - 8 * 2) / 3; // 3-column grid, full content width

// ── Constants ─────────────────────────────────────────────────────────────────
const FILTERS = ['All', 'Blood Test', 'General Medical', 'ECG', 'X-ray / Scan', 'Prescription', 'Other'];

const CATEGORY_COLOR: Record<string, string> = {
  'Blood Test': '#FF6B6B',
  'General Medical': '#4ECDC4',
  'ECG': '#9B59B6',
  'X-ray / Scan': '#3498DB',
  'Prescription': '#2ECC71',
  'Other': '#F39C12',
};

const CATEGORY_ICON: Record<string, string> = {
  'Blood Test': 'water',
  'General Medical': 'medkit',
  'ECG': 'pulse',
  'X-ray / Scan': 'scan',
  'Prescription': 'document-text',
  'Other': 'folder',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function shortCategory(cat?: string) {
  if (!cat) return 'Other';
  if (cat.includes('Blood')) return 'Blood Test';
  if (cat.includes('ECG')) return 'ECG';
  if (cat.includes('X-ray') || cat.includes('Scan')) return 'X-ray / Scan';
  if (cat.includes('Prescription')) return 'Prescription';
  if (cat.includes('General')) return 'General Medical';
  return 'Other';
}

function getMonthLabel(raw?: string) {
  if (!raw) return 'Unknown';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('default', { month: 'long', year: 'numeric' });
}

function formatDate(raw?: string) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

function hasImageUrl(doc: UserDocument) {
  // Treat any doc with a file_url as potentially previewable;
  // use onError to fall back to icon if the URL isn't an image.
  return !!doc.file_url;
}

// ── Document Thumbnail ────────────────────────────────────────────────────────
function DocThumb({ item }: { item: UserDocument }) {
  const [imgError, setImgError] = React.useState(false);
  const cat = shortCategory(item.report_category);
  const color = CATEGORY_COLOR[cat] ?? '#888';
  const icon = CATEGORY_ICON[cat] ?? 'document';
  const showImg = hasImageUrl(item) && !imgError;

  return (
    <TouchableOpacity
      style={styles.thumb}
      onPress={() => router.push(`/report-detail?id=${item.id}`)}
      activeOpacity={0.82}
    >
      {showImg ? (
        <Image
          source={{ uri: item.file_url }}
          style={styles.thumbImage}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <View style={styles.thumbPlaceholder}>
          <Ionicons name={icon as any} size={32} color="#0a7aff" />
        </View>
      )}

      {/* Name overlay at bottom */}
      <View style={styles.thumbOverlay}>
        <Text style={styles.thumbName} numberOfLines={2}>{item.report_name}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Month Section (no timeline rail) ─────────────────────────────────────────
function MonthSection({ label, items }: { label: string; items: UserDocument[] }) {
  return (
    <View style={styles.sectionWrap}>
      {/* Month header */}
      <Text style={styles.monthLabel}>{label}</Text>

      {/* 3-column photo grid */}
      <View style={styles.grid}>
        {items.map((doc) => (
          <DocThumb key={doc.id} item={doc} />
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReportsScreen() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [reports, setReports] = useState<UserDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function load() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const docs = await getUserDocuments(user.id);
            if (active) setReports(docs);
          }
        } catch (e) {
          console.error('Failed to load reports:', e);
        } finally {
          if (active) setLoading(false);
        }
      }
      load();
      return () => { active = false; };
    }, [])
  );

  // Filter + search
  const shown = reports.filter(
    (r) =>
      (filter === 'All' || r.report_category?.includes(filter)) &&
      r.report_name?.toLowerCase().includes(search.toLowerCase())
  );

  // Sort by report_date descending (newest first), then group by month
  const grouped = useMemo(() => {
    const sorted = [...shown].sort((a, b) => {
      const dateA = new Date(a.report_date || a.created_at).getTime();
      const dateB = new Date(b.report_date || b.created_at).getTime();
      return dateB - dateA; // descending: latest first
    });
    const map = new Map<string, UserDocument[]>();
    sorted.forEach((doc) => {
      const key = getMonthLabel(doc.report_date || doc.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(doc);
    });
    return Array.from(map.entries()); // [['May 2026', [...]], ...]
  }, [shown]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports</Text>
          {!loading && (
            <Text style={styles.headerSub}>
              {shown.length} {shown.length === 1 ? 'document' : 'documents'}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => router.push('/upload')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Search ── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={15} color={Colors.gray[400]} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search reports…"
            placeholderTextColor={Colors.gray[400]}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={15} color={Colors.gray[300]} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Filters ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              activeOpacity={0.75}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Timeline content ── */}
        {loading ? (
          <View style={styles.emptyWrap}>
            <ActivityIndicator size="large" color="#0a7aff" />
            <Text style={styles.emptySubtitle}>Loading your reports…</Text>
          </View>
        ) : grouped.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="folder-open-outline" size={36} color={Colors.gray[400]} />
            </View>
            <Text style={styles.emptyTitle}>No reports found</Text>
            <Text style={styles.emptySubtitle}>
              {search || filter !== 'All'
                ? 'Try adjusting your search or filter.'
                : 'Upload your first report to get started.'}
            </Text>
            {!search && filter === 'All' && (
              <TouchableOpacity
                style={styles.emptyUploadBtn}
                onPress={() => router.push('/upload')}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={15} color="#fff" />
                <Text style={styles.emptyUploadText}>Upload Report</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.timeline}>
            {grouped.map(([label, items]) => (
              <MonthSection
                key={label}
                label={label}
                items={items}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f6fa' },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 14,
    backgroundColor: '#f5f6fa',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
  },
  headerSub: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 1,
    fontWeight: '500',
  },
  uploadBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0a7aff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a7aff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  scroll: { paddingHorizontal: 16, paddingBottom: 48, gap: 14 },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1f2937', padding: 0 },

  // Filters
  filterRow: { gap: 6, paddingVertical: 2 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterChipActive: { backgroundColor: '#0a7aff', borderColor: '#0a7aff' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterTextActive: { color: '#fff' },

  // Timeline
  timeline: { gap: 0 },

  sectionWrap: {
    paddingTop: 4,

    paddingBottom: 24,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  monthCount: {
    fontSize: 11,
    color: '#9ca3af',
    fontWeight: '500',
    marginBottom: 10,
  },

  // 3-column grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  // Thumbnail card
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  thumbOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.48)',
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  thumbName: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#fff',
    lineHeight: 13,
  },

  // Empty
  emptyWrap: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 10,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  emptyUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#0a7aff',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  emptyUploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
});
