import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity, Modal, Dimensions, StatusBar, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { BtnPrimary, TopBar } from '@/components/ui/MediComponents';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { UserDocument } from '@/lib/documents';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── File type helpers ────────────────────────────────────────────────────────
function isImage(mimeType?: string, fileName?: string) {
  if (mimeType) return mimeType.startsWith('image/');
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].includes(ext || '');
}

function isPdf(mimeType?: string, fileName?: string) {
  if (mimeType) return mimeType === 'application/pdf';
  return (fileName || '').toLowerCase().endsWith('.pdf');
}

// ── In-app full-screen document viewer (images + PDFs) ──────────────────────
function DocViewer({
  url, isImg, visible, onClose,
}: {
  url: string; isImg: boolean; visible: boolean; onClose: () => void;
}) {
  const [webLoading, setWebLoading] = useState(true);

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <View style={dv.root}>
        {/* Header bar */}
        <View style={dv.header}>
          <TouchableOpacity style={dv.closeBtn} onPress={onClose} activeOpacity={0.8}>
            <Ionicons name="chevron-down" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={dv.headerTitle}>{isImg ? 'Image' : 'Document'}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Content */}
        {isImg ? (
          <View style={dv.imgWrap}>
            <Image
              source={{ uri: url }}
              style={dv.img}
              contentFit="contain"
              priority="high"
              cachePolicy="disk"
            />
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {webLoading && (
              <View style={dv.webLoader}>
                <ActivityIndicator size="large" color="#9FCC3B" />
                <Text style={dv.webLoaderText}>Loading document…</Text>
              </View>
            )}
            <WebView
              source={{
                uri: Platform.OS === 'android' && !isImg
                  ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`
                  : url
              }}
              style={{ flex: 1 }}
              onLoadStart={() => setWebLoading(true)}
              onLoadEnd={() => setWebLoading(false)}
              onError={() => setWebLoading(false)}
            />
          </View>
        )}
      </View>
    </Modal>
  );
}

const dv = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0a0a0a' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16,
    backgroundColor: '#0a0a0a',
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '600', color: '#fff' },
  imgWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  img: { width: SCREEN_W, height: SCREEN_H - 120 },
  webLoader: {
    position: 'absolute', inset: 0, zIndex: 10,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  webLoaderText: { fontSize: 13, color: Colors.gray[400] },
});


// ── Main screen ──────────────────────────────────────────────────────────────
export default function ReportDetailScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [doc, setDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    async function loadDoc() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('user_documents')
          .select('*')
          .eq('id', id)
          .single();
        if (data) {
          setDoc(data);
          if (data.file_url) {
            const { data: urlData } = supabase.storage
              .from('user_docs')
              .getPublicUrl(data.file_url);
            setPublicUrl(urlData?.publicUrl || null);
          }
        }
        if (error) console.error(error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id]);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={styles.container}>
        <TopBar title="Report detail" onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <ActivityIndicator size="large" color="#9FCC3B" />
          <Text style={{ fontSize: 13, color: Colors.gray[400] }}>Loading report…</Text>
        </View>
      </View>
    );
  }

  if (!doc) {
    return (
      <View style={styles.container}>
        <TopBar title="Report detail" onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <Ionicons name="document-outline" size={40} color={Colors.gray[300]} />
          <Text style={{ color: Colors.gray[500], fontSize: 14 }}>Report not found</Text>
        </View>
      </View>
    );
  }

  const fileIsImage = isImage(doc.file_type, doc.file_name);
  const fileIsPdf = isPdf(doc.file_type, doc.file_name);

  return (
    <View style={styles.container}>

      {/* In-app full-screen viewer */}
      {publicUrl && (
        <DocViewer
          url={publicUrl}
          isImg={fileIsImage}
          visible={viewerOpen}
          onClose={() => setViewerOpen(false)}
        />
      )}

      <TopBar title="Report detail" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Document preview card ── */}
        <TouchableOpacity
          style={styles.previewCard}
          activeOpacity={publicUrl ? 0.85 : 1}
          onPress={() => publicUrl && setViewerOpen(true)}
        >
          {fileIsImage && publicUrl ? (
            <>
              <Image
                source={{ uri: publicUrl }}
                style={styles.previewImage}
                contentFit="cover"
                priority="high"
                cachePolicy="disk"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.previewGradient}
              >
                <View style={styles.previewTapHint}>
                  <Ionicons name="expand-outline" size={14} color="#fff" />
                  <Text style={styles.previewTapText}>Tap to view full screen</Text>
                </View>
              </LinearGradient>
            </>
          ) : publicUrl ? (
            // PDF / other — show a live first-page preview via WebView
            <>
              <WebView
                source={{
                  uri: Platform.OS === 'android'
                    ? `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(publicUrl)}`
                    : publicUrl
                }}
                style={styles.previewWebView}
                scrollEnabled={false}
                pointerEvents="none"
                scalesPageToFit
                bounces={false}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
              />
              {/* Tap-to-open overlay */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.55)']}
                style={styles.previewGradient}
                pointerEvents="none"
              >
                <View style={styles.previewTapHint}>
                  <Ionicons name="eye-outline" size={14} color="#fff" />
                  <Text style={styles.previewTapText}>Tap to open</Text>
                </View>
              </LinearGradient>
            </>
          ) : (
            // No URL yet — simple neutral placeholder
            <View style={styles.previewPlaceholderEmpty}>
              <Ionicons name="document-outline" size={42} color={Colors.cloud[300]} />
              <Text style={styles.previewNoFile}>No file attached</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ── Report name + meta card ── */}
        <View style={styles.metaCard}>
          {/* Title row */}
          <View style={styles.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.reportName} numberOfLines={2}>{doc.report_name}</Text>
              {doc.file_name && (
                <Text style={styles.reportFileName} numberOfLines={1}>{doc.file_name}</Text>
              )}
            </View>
            {/* Inline secure badge */}
            <View style={styles.securePill}>
              <Ionicons name="shield-checkmark-outline" size={11} color={Colors.cloud[800]} />
              <Text style={styles.securePillText}>Saved</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Chip grid — 3 fields side by side */}
          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Ionicons name="folder-outline" size={13} color={Colors.cloud[800]} style={{ marginBottom: 4 }} />
              <Text style={styles.chipLabel}>CATEGORY</Text>
              <Text style={styles.chipValue} numberOfLines={2}>{doc.report_category || '—'}</Text>
            </View>
            <View style={styles.chipDivider} />
            <View style={styles.chip}>
              <Ionicons name="business-outline" size={13} color={Colors.cloud[800]} style={{ marginBottom: 4 }} />
              <Text style={styles.chipLabel}>HOSPITAL</Text>
              <Text style={styles.chipValue} numberOfLines={2}>{doc.hospital_name || '—'}</Text>
            </View>
            <View style={styles.chipDivider} />
            <View style={styles.chip}>
              <Ionicons name="calendar-outline" size={13} color={Colors.cloud[800]} style={{ marginBottom: 4 }} />
              <Text style={styles.chipLabel}>DATE</Text>
              <Text style={styles.chipValue}>
                {doc.report_date
                  ? (() => {
                    const d = new Date(doc.report_date);
                    return isNaN(d.getTime())
                      ? doc.report_date
                      : `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
                  })()
                  : '—'}
              </Text>
            </View>
          </View>

          {/* Notes — only if present */}
          {doc.additional_notes ? (
            <View style={styles.notesBox}>
              <Text style={styles.notesLabel}>NOTES</Text>
              <Text style={styles.notesText}>{doc.additional_notes}</Text>
            </View>
          ) : null}
        </View>

        <BtnPrimary onPress={() => router.push(`/report-insight?id=${id}`)}>
          Ask AI about this report
        </BtnPrimary>

      </ScrollView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 16, gap: 14, paddingBottom: 48 },

  // Preview card
  previewCard: {
    borderRadius: 20, overflow: 'hidden',
    height: 220,
    backgroundColor: Colors.white,
    borderWidth: 1, borderColor: Colors.cloud[100],
  },
  previewImage: { width: '100%', height: '100%' },
  previewWebView: { flex: 1, backgroundColor: '#fff' },
  previewGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    height: 72, justifyContent: 'flex-end', padding: 14,
  },
  previewTapHint: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  previewTapText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  previewPlaceholderEmpty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  previewNoFile: { fontSize: 12, color: Colors.cloud[400] },

  // Report meta card
  metaCard: {
    backgroundColor: Colors.cloud[50],
    borderRadius: 20,
    padding: 16,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  reportName: { fontSize: 18, fontWeight: '700', color: Colors.gray[800], letterSpacing: -0.4 },
  reportFileName: { fontSize: 11, color: Colors.gray[400], marginTop: 3 },
  securePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F8F4', borderWidth: 1, borderColor: '#D6EEA5',
    borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4, marginTop: 2,
  },
  securePillText: { fontSize: 10, fontWeight: '700', color: Colors.cloud[800] },
  divider: { height: 1, backgroundColor: Colors.cloud[100], marginVertical: 14 },

  // Chip grid
  chipRow: { flexDirection: 'row', alignItems: 'flex-start' },
  chip: { flex: 1, alignItems: 'center', paddingHorizontal: 6 },
  chipDivider: { width: 1, backgroundColor: Colors.cloud[100], alignSelf: 'stretch', marginVertical: 4 },
  chipLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.6, textAlign: 'center', marginBottom: 3 },
  chipValue: { fontSize: 12, fontWeight: '600', color: Colors.gray[700], textAlign: 'center' },

  // Notes
  notesBox: {
    marginTop: 14, padding: 12,
    backgroundColor: Colors.white, borderRadius: 12,

  },
  notesLabel: { fontSize: 9, fontWeight: '700', color: Colors.gray[400], letterSpacing: 0.6, marginBottom: 4 },
  notesText: { fontSize: 13, color: Colors.gray[600], lineHeight: 20 },
});
