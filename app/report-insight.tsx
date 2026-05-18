import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Animated, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Gradients } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { TopBar } from '@/components/ui/MediComponents';
import { LinearGradient } from 'expo-linear-gradient';

// ── Edge function endpoint ────────────────────────────────────────────────────
const EDGE_URL = 'https://eoogmrwzzrhwxtctyxer.supabase.co/functions/v1/Medex-AI';

// ── Simple markdown-like text renderer ───────────────────────────────────────
// Handles: **bold**, bullet lines starting with "- " or "• ", numbered lines, plain text.
function RichText({ text }: { text: string }) {
  const lines = text.split('\n');

  return (
    <View style={{ gap: 6 }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={i} style={{ height: 4 }} />;

        // Bullet line
        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const content = trimmed.replace(/^[-•]\s*/, '');
          return (
            <View key={i} style={rt.bulletRow}>
              <View style={rt.bullet} />
              <InlineBold text={content} style={rt.bodyText} />
            </View>
          );
        }

        // Numbered list  "1. ..."
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\./)?.[1];
          const content = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <View key={i} style={rt.bulletRow}>
              <Text style={rt.numText}>{num}.</Text>
              <InlineBold text={content} style={rt.bodyText} />
            </View>
          );
        }

        // Heading line (all caps or starts with ###)
        if (/^#+\s/.test(trimmed) || (trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60)) {
          const content = trimmed.replace(/^#+\s*/, '');
          return <InlineBold key={i} text={content} style={rt.headingText} />;
        }

        // Plain paragraph
        return <InlineBold key={i} text={trimmed} style={rt.bodyText} />;
      })}
    </View>
  );
}

// Renders **bold** segments inline
function InlineBold({ text, style }: { text: string; style: any }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  if (parts.length === 1) return <Text style={style}>{text}</Text>;
  return (
    <Text style={style}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? <Text key={i} style={[style, { fontWeight: '700' }]}>{part}</Text>
          : <Text key={i}>{part}</Text>
      )}
    </Text>
  );
}

const rt = StyleSheet.create({
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.cloud[700], marginTop: 7, flexShrink: 0 },
  numText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[700], minWidth: 20, marginTop: 1 },
  bodyText: { flex: 1, fontSize: 14, color: Colors.gray[700], lineHeight: 22 },
  headingText: { fontSize: 15, fontWeight: '700', color: Colors.gray[800], letterSpacing: -0.3, marginTop: 6 },
});

// ── Pulsing skeleton while loading ───────────────────────────────────────────
function SkeletonLine({ width, height = 14 }: { width: string | number; height?: number }) {
  const anim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  // anim is a stable ref — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Animated.View
      style={{
        width: width as any, height, borderRadius: 6,
        backgroundColor: Colors.cloud[100],
        opacity: anim,
      }}
    />
  );
}

function LoadingSkeleton() {
  return (
    <View style={{ gap: 12, paddingTop: 4 }}>
      <SkeletonLine width="90%" />
      <SkeletonLine width="75%" />
      <SkeletonLine width="85%" />
      <SkeletonLine width="60%" />
      <View style={{ height: 8 }} />
      <SkeletonLine width="80%" />
      <SkeletonLine width="70%" />
      <SkeletonLine width="88%" />
      <View style={{ height: 8 }} />
      <SkeletonLine width="55%" />
      <SkeletonLine width="78%" />
      <SkeletonLine width="65%" />
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function ReportInsightScreen() {
  const { id: rawId } = useLocalSearchParams();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated. Please log in again.');

      const res = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ document_id: id }),
      });

      const json = await res.json();

      if (!res.ok || json.error) throw new Error(json.error || 'AI service error');

      setExplanation(json.explanation);
      setCached(!!json.cached);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!id) { setError('No document ID provided.'); setLoading(false); return; }
    fetchInsight();
  }, [id, fetchInsight]);

  return (
    <View style={styles.container}>
      <TopBar title="AI Insights" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── AI badge header ── */}
        <LinearGradient
          colors={['#E8F5C8', '#F5FBE8']}
          style={styles.heroBadge}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroIcon}>
            <LinearGradient colors={Gradients.default} style={styles.heroIconGrad}>
              <Ionicons name="sparkles" size={22} color="#fff" />
            </LinearGradient>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Medex AI Analysis</Text>
            <Text style={styles.heroSub}>
              {loading ? 'Reading your report…' : 'Analysis complete'}
            </Text>
          </View>
        </LinearGradient>

        {/* ── Disclaimer chip ── */}
        <View style={styles.disclaimer}>
          <Ionicons name="information-circle-outline" size={14} color={Colors.gray[400]} />
          <Text style={styles.disclaimerText}>
            AI insights are for educational purposes only. Always consult a qualified doctor.
          </Text>
        </View>

        {/* ── Content ── */}
        <View style={styles.card}>
          {loading ? (
            <LoadingSkeleton />
          ) : error ? (
            <View style={styles.errorWrap}>
              <Ionicons name="alert-circle-outline" size={40} color="#F87171" />
              <Text style={styles.errorTitle}>Couldn't load insight</Text>
              <Text style={styles.errorMsg}>{error}</Text>
              <TouchableOpacity style={styles.retryBtn} onPress={fetchInsight} activeOpacity={0.8}>
                <LinearGradient colors={Gradients.default} style={styles.retryGrad}>
                  <Ionicons name="refresh" size={15} color="#fff" />
                  <Text style={styles.retryText}>Try Again</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : explanation ? (
            <RichText text={explanation} />
          ) : null}
        </View>

        {/* ── Bottom CTA ── */}
        {!loading && !error && (
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => router.push(`/voice-chat?document_id=${id}` as any)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={Gradients.default} style={styles.chatBtnGrad}>
              <Ionicons name="chatbubble-ellipses-outline" size={17} color="#fff" />
              <Text style={styles.chatBtnText}>Continue in Health Chat</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scroll: { padding: 16, gap: 14, paddingBottom: 48 },

  // Hero badge
  heroBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#D6EEA5',
  },
  heroIcon: { flexShrink: 0 },
  heroIconGrad: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 15, fontWeight: '700', color: Colors.gray[800], letterSpacing: -0.3 },
  heroSub: { fontSize: 12, color: Colors.gray[500], marginTop: 2 },
  cachedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#E8F5C8', borderRadius: 99,
    paddingHorizontal: 8, paddingVertical: 4,
    borderWidth: 1, borderColor: '#C5E87C',
  },
  cachedText: { fontSize: 10, fontWeight: '700', color: Colors.cloud[700] },

  // Disclaimer
  disclaimer: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: '#FAFAFA', borderRadius: 12,
    padding: 11, borderWidth: 1, borderColor: Colors.gray[100],
  },
  disclaimerText: { flex: 1, fontSize: 11, color: Colors.gray[400], lineHeight: 16 },

  // Content card
  card: {
    backgroundColor: Colors.cloud[50], borderRadius: 20,
    padding: 18, borderWidth: 1, borderColor: Colors.cloud[100],
    minHeight: 120,
  },

  // Error state
  errorWrap: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: Colors.gray[700] },
  errorMsg: { fontSize: 13, color: Colors.gray[500], textAlign: 'center', lineHeight: 20, paddingHorizontal: 12 },
  retryBtn: { marginTop: 6 },
  retryGrad: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 24, paddingVertical: 12, borderRadius: 99,
  },
  retryText: { fontSize: 13, fontWeight: '700', color: '#fff' },

  // Bottom chat CTA
  chatBtn: { borderRadius: 14, overflow: 'hidden' },
  chatBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15,
  },
  chatBtnText: { fontSize: 14, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
});
