import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card, BtnSecondary, BtnOutline, TopBar } from '@/components/ui/MediComponents';
import { supabase } from '@/lib/supabase';
import { UserDocument } from '@/lib/documents';
import * as WebBrowser from 'expo-web-browser';

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams();
  const [doc, setDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDoc() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('user_documents')
          .select('*')
          .eq('id', id)
          .single();
        if (data) setDoc(data);
        if (error) console.error(error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopBar title="Report detail" onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.cloud[500]} />
        </View>
      </SafeAreaView>
    );
  }

  if (!doc) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <TopBar title="Report detail" onBack={() => router.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: Colors.gray[500] }}>Report not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatSubtitle = () => {
    let parts = [];
    if (doc.report_date) parts.push(doc.report_date);
    if (doc.hospital_name) parts.push(doc.hospital_name);
    return parts.join(' · ');
  };

  const handleViewOriginal = async () => {
    // We stored the relative filePath in file_url.
    // Let's get the public signed url or public url
    const { data: { publicUrl } } = supabase.storage.from('user_docs').getPublicUrl(doc.file_url);
    if (publicUrl) {
      await WebBrowser.openBrowserAsync(publicUrl);
    }
  };

  const parseOCRText = (text: string) => {
    if (!text) return { abnormal: [], normal: [] };

    const reports: any[] = [];
    const lines = text.split('\n');

    // A robust regex to find: Name, Value, Unit(optional), Min, Max
    const regex = /^([a-zA-Z][a-zA-Z\s\(\)]+?)[:\-]?\s+([\d\.]+)\s*([^0-9\s\(]+)?\s*(?:(?:\(|\[|Normal|Ref|Range)[:\s]*)*([\d\.]+)\s*(?:-|to|–)\s*([\d\.]+)/i;

    for (let line of lines) {
      line = line.trim();
      if (!line) continue;

      const m = line.match(regex);
      if (m) {
        const name = m[1].trim();
        const value = parseFloat(m[2]);
        const unit = m[3] ? m[3].trim() : "";
        const min = parseFloat(m[4]);
        const max = parseFloat(m[5]);

        // Skip obvious bad matches
        if (name.length > 2 && !isNaN(value) && !isNaN(min) && !isNaN(max) && !name.toLowerCase().includes('date')) {
          reports.push({ name, value, unit, min, max });
        }
      }
    }

    // Fallback global match if line-by-line found nothing
    if (reports.length === 0) {
      const globalRegex = /([a-zA-Z][a-zA-Z\s]+?)[:\-]?\s+([\d\.]+)\s*([^0-9\s\(\-\+]+)?\s*(?:(?:\(|\[)?(?:Normal|Ref|Range)?[:\s]*([\d\.]+)\s*(?:-|to|–)\s*([\d\.]+)(?:\)|\])?)/gi;
      const matches = Array.from(text.matchAll(globalRegex));
      for (const m of matches) {
        const name = m[1].trim();
        const value = parseFloat(m[2]);
        const unit = m[3] ? m[3].trim() : "";
        const min = parseFloat(m[4]);
        const max = parseFloat(m[5]);

        if (name.length > 2 && !isNaN(value) && !isNaN(min) && !isNaN(max) && !name.toLowerCase().includes('date')) {
          reports.push({ name, value, unit, min, max });
        }
      }
    }

    // De-duplicate by name
    const uniqueReports = Array.from(new Map(reports.map(item => [item.name, item])).values());

    const abnormal = [];
    const normal = [];

    for (const test of uniqueReports) {
      if (test.value < test.min || test.value > test.max) {
        abnormal.push(test);
      } else {
        normal.push(test);
      }
    }

    return { abnormal, normal };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TopBar title="Report detail" onBack={() => router.back()} rightLabel="Share" onRight={() => { }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Main Info */}
        <Card style={styles.card}>
          <View style={styles.reportHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.reportName}>{doc.report_name}</Text>
              <Text style={styles.reportMeta}>{formatSubtitle() || 'Recently uploaded'}</Text>
            </View>
            <Badge label={doc.report_category || "Saved"} type="blue" />
          </View>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Category:</Text>
            <Text style={styles.infoValue}>{doc.report_category}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File Name:</Text>
            <Text style={styles.infoValue}>{doc.file_name}</Text>
          </View>
          {doc.hospital_name ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hospital:</Text>
              <Text style={styles.infoValue}>{doc.hospital_name}</Text>
            </View>
          ) : null}
          {doc.report_date ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{doc.report_date}</Text>
            </View>
          ) : null}
          {doc.additional_notes ? (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes:</Text>
              <Text style={styles.infoValue}>{doc.additional_notes}</Text>
            </View>
          ) : null}
        </Card>

        {/* Parsed Insights */}
        <Card style={styles.aiCard}>
          <Text style={styles.aiTitle}>🤖 Report Insights</Text>
          {!doc.extracted_text ? (
            <Text style={[styles.aiText, { color: Colors.gray[400], fontStyle: 'italic' }]}>
              Analyzing document text in the background...
            </Text>
          ) : (
            <View>
              {(() => {
                const { abnormal, normal } = parseOCRText(doc.extracted_text || "");

                if (abnormal.length === 0 && normal.length === 0) {
                  return (
                    <Text style={styles.aiText}>
                      We couldn't automatically detect standard tabular test ranges in this document.
                    </Text>
                  );
                }

                return (
                  <View style={{ gap: 12 }}>
                    {abnormal.length > 0 ? (
                      <View style={{ gap: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.amber[700] }}>
                          ⚠️ Values outside normal range:
                        </Text>
                        {abnormal.map((t, idx) => (
                          <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                            <Text style={{ fontSize: 14, color: Colors.amber[700] }}>•</Text>
                            <Text style={{ fontSize: 13, color: Colors.cloud[800], flex: 1 }}>
                              <Text style={{ fontWeight: '700' }}>{t.name}</Text>: {t.value} {t.unit}
                              <Text style={{ color: Colors.amber[700], fontWeight: '600' }}>
                                {t.value > t.max ? ' (High)' : ' (Low)'}
                              </Text>
                              {"\n"}
                              <Text style={{ color: Colors.gray[400], fontSize: 11 }}>Normal Range: {t.min} - {t.max}</Text>
                            </Text>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={{ fontSize: 16 }}>✅</Text>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.emerald[700], flex: 1 }}>
                          All detected parameters are within normal range.
                        </Text>
                      </View>
                    )}

                    {normal.length > 0 && (
                      <Text style={{ fontSize: 12, color: Colors.gray[500], fontStyle: 'italic', marginTop: 4 }}>
                        {abnormal.length > 0 ? 'Other ' : ''}{normal.length} parameter{normal.length > 1 ? 's' : ''} {normal.length === 1 ? 'is' : 'are'} normal.
                      </Text>
                    )}
                  </View>
                );
              })()}
            </View>
          )}
        </Card>

        <BtnOutline onPress={handleViewOriginal}>View original Document</BtnOutline>
        <BtnSecondary onPress={() => router.push('/voice-chat')}>Ask AI about this report</BtnSecondary>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  scroll: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  reportName: { fontSize: 16, fontWeight: '700', color: Colors.gray[800] },
  reportMeta: { fontSize: 11, color: Colors.gray[400], marginTop: 4 },
  divider: { height: 1, backgroundColor: Colors.cloud[100], marginBottom: 10 },
  infoRow: { flexDirection: 'row', paddingVertical: 4 },
  infoLabel: { fontSize: 12, color: Colors.gray[500], width: 90 },
  infoValue: { fontSize: 12, color: Colors.gray[800], flex: 1, fontWeight: '500' },
  aiCard: { backgroundColor: Colors.cloud[50], borderColor: Colors.cloud[200], padding: 16, gap: 8 },
  aiTitle: { fontSize: 12, fontWeight: '700', color: Colors.cloud[700] },
  aiText: { fontSize: 12, color: Colors.cloud[700], lineHeight: 18 },
});
