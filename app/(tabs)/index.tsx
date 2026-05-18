import { Badge, Card } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState, useCallback } from 'react';
import { getUserDocuments, UserDocument } from '@/lib/documents';
import {
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View, ActivityIndicator
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

function formatDate(raw?: string) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

const vitals = [
  { label: 'Blood Pressure', val: '118/76', unit: 'mmHg', badge: 'OK', type: 'green' as const },
  { label: 'Glucose', val: '108', unit: 'mg/dL', badge: 'Watch', type: 'yellow' as const },
  { label: 'Heart Rate', val: '72', unit: 'bpm', badge: 'OK', type: 'green' as const },
  { label: 'BMI', val: '22.4', unit: '', badge: 'OK', type: 'green' as const },
];


const quickActions = [
  { label: 'Upload', emoji: '📤', route: '/upload' },
  { label: 'Predict', emoji: '🔬', route: '/enter-vitals' },
  { label: 'Trends', emoji: '📊', route: '/(tabs)/health-trends' },
];

export default function DashboardScreen() {
  const [userName, setUserName] = useState('...');
  const [initials, setInitials] = useState('');
  const [healthScore, setHealthScore] = useState(78);
  const [recentDocs, setRecentDocs] = useState<UserDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      async function loadDocs() {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const docs = await getUserDocuments(user.id);
            if (active) {
              setRecentDocs(docs.slice(0, 3));
            }
          }
        } catch (e) {
          console.error(e);
        } finally {
          if (active) setLoadingDocs(false);
        }
      }
      loadDocs();
      return () => { active = false; };
    }, [])
  );

  // Calculate dynamic circle progress
  const arcRadius = 100;
  const arcLength = 2 * Math.PI * arcRadius;
  const arcOffset = arcLength - (healthScore / 100) * arcLength;

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();


      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();

        if (data && data.full_name) {
          const firstName = data.full_name.split(' ')[0];
          setUserName(firstName);

          const parts = data.full_name.trim().split(/\s+/);
          if (parts.length === 1) {
            setInitials(parts[0].substring(0, 2).toUpperCase());
          } else {
            setInitials((parts[0][0] + parts[parts.length - 1][0]).toUpperCase());
          }
        } else {
          setUserName('User');
          setInitials('U');
        }
      }
    }
    loadProfile();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 16) return 'Good afternoon,';
    return 'Good evening,';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.name}>{userName}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')} activeOpacity={0.8}>
            <Ionicons name="notifications-outline" size={20} color={Colors.gray[800]} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} activeOpacity={0.8}>
            <View style={[styles.avatar, { backgroundColor: Colors.cloud[800] }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Health Score */}
        <View style={[styles.scoreBanner, { backgroundColor: '#E3F5C7' }]}>
          <View style={styles.gaugeWrap}>
            <Svg width={240} height={240} viewBox="0 0 240 240">
              {/* Background circle */}
              <Circle
                cx="120"
                cy="120"
                r={arcRadius}
                stroke="rgba(0,0,0,0.05)"
                strokeWidth={14}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx="120"
                cy="120"
                r={arcRadius}
                stroke="#9FCC3B"
                strokeWidth={14}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={arcLength}
                strokeDashoffset={arcOffset}
                transform="rotate(-90 120 120)"
              />
            </Svg>
            {/* Centered text/icon */}
            <View style={styles.gaugeCenter}>
              <Ionicons name="heart" size={24} color="#9FCC3B" />
              <Text style={styles.scoreNumLarge}>{healthScore}</Text>
              <Text style={styles.scoreMaxLabel}>/100</Text>
            </View>
          </View>

          <View style={styles.scoreInfo}>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <Text style={styles.scoreRating}>Good • <Text style={styles.scoreTime}>Updated 2h ago</Text></Text>
          </View>
        </View>

        {/* Vitals Grid */}
        <View style={styles.vitalsGrid}>
          {vitals.map((v) => (
            <Card key={v.label} style={styles.vitalCard}>
              <Badge label={v.badge} type={v.type} />
              <Text style={styles.vitalVal}>{v.val} <Text style={styles.vitalUnit}>{v.unit}</Text></Text>
              <Text style={styles.vitalLabel}>{v.label}</Text>
            </Card>
          ))}
        </View>

        {/* Recent Reports Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent reports</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <Card style={styles.sectionCard}>
          {loadingDocs ? (
            <ActivityIndicator size="small" color={Colors.cloud[800]} style={{ padding: 24 }} />
          ) : recentDocs.length === 0 ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={{ color: Colors.gray[500], fontSize: 13 }}>No recent reports yet</Text>
            </View>
          ) : (
            recentDocs.map((r, i) => (
              <TouchableOpacity
                key={r.id}
                style={[styles.reportRow, i === 0 && { borderTopWidth: 0 }]}
                onPress={() => router.push(`/report-detail?id=${r.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.reportIcon}>
                  <Ionicons name="document-text" size={16} color={Colors.gray[400]} />
                </View>
                <View style={styles.reportInfo}>
                  <Text style={styles.reportName} numberOfLines={1}>{r.report_name}</Text>
                  <Text style={styles.reportDate}>{formatDate(r.report_date || r.created_at)}</Text>
                </View>
                <Badge label={r.report_category?.split(' ')[0] || 'Report'} type="green" />
              </TouchableOpacity>
            ))
          )}
        </Card>

        {/* AI Assistant Strip */}
        <TouchableOpacity style={styles.aiStrip} onPress={() => router.push('/voice-chat')} activeOpacity={0.85}>
          <LinearGradient colors={['#E3F5C7', '#E3F5C7']} style={styles.aiIcon}>
            <Ionicons name="mic" size={20} color={Colors.cloud[800]} />
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ask health assistant</Text>
            <Text style={styles.aiSub}>Tap to speak — AI powered</Text>
          </View>
          <Text style={styles.aiChevron}>›</Text>
        </TouchableOpacity>

        {/* Quick Actions Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.quickGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.label} style={styles.quickBtn} onPress={() => router.push(a.route as any)} activeOpacity={0.8}>
              <Text style={styles.quickEmoji}>{a.emoji}</Text>
              <Text style={styles.quickLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: Colors.white,
  },
  greeting: { fontSize: 11, color: Colors.gray[400], fontWeight: '500' },
  name: { fontSize: 28, fontWeight: '800', color: Colors.gray[800], letterSpacing: -0.6 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[800], alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: Colors.red[500], borderRadius: 4, borderWidth: 1.5, borderColor: Colors.white },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  scroll: { padding: 16, gap: 12, paddingBottom: 110 },

  scoreBanner: {
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  gaugeWrap: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugeCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumLarge: { color: '#18332F', fontSize: 56, fontWeight: '800', marginTop: -4 },
  scoreMaxLabel: { color: 'rgba(0,0,0,0.4)', fontSize: 14, fontWeight: '600', marginTop: -4 },
  scoreInfo: { alignItems: 'center', gap: 2 },
  scoreLabel: { color: 'rgba(0,0,0,0.5)', fontSize: 13, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  scoreRating: { color: '#18332F', fontSize: 16, fontWeight: '700' },
  scoreTime: { color: 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: '400' },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#9FCC3B', alignItems: 'center', justifyContent: 'center' },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalCard: { width: '48%', padding: 18, gap: 8, borderRadius: 24, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  vitalVal: { fontSize: 24, fontWeight: '800', color: Colors.gray[800], marginTop: 6 },
  vitalUnit: { fontSize: 12, color: Colors.gray[400], fontWeight: '500' },
  vitalLabel: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },

  sectionCard: { padding: 0, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white, overflow: 'hidden' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', letterSpacing: -0.5 },
  seeAll: { fontSize: 14, color: Colors.cloud[800], fontWeight: '600' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: Colors.gray[100] },
  reportIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  reportDate: { fontSize: 13, color: Colors.gray[400], marginTop: 2 },

  aiStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: Colors.gray[200] },
  aiIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: Colors.cloud[700] },
  aiSub: { fontSize: 10, color: Colors.cloud[500], marginTop: 2 },
  aiChevron: { fontSize: 24, color: Colors.cloud[800] },

  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, backgroundColor: Colors.white, borderRadius: 20, padding: 14, alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.gray[200] },
  quickEmoji: { fontSize: 24 },
  quickLabel: { fontSize: 13, fontWeight: '700', color: Colors.gray[700] },
});
