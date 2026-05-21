import { Badge, Card } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState, useCallback } from 'react';
import { getUserDocuments, UserDocument } from '@/lib/documents';
import * as SecureStore from 'expo-secure-store';
import {
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View, ActivityIndicator
} from 'react-native';


const HEALTH_TIPS = [
  { icon: 'water-outline' as const, tip: 'Drink at least 8 glasses of water today to stay hydrated and support kidney function.', category: 'Hydration' },
  { icon: 'walk-outline' as const, tip: 'A brisk 30-minute walk lowers blood pressure and improves heart health significantly.', category: 'Activity' },
  { icon: 'moon-outline' as const, tip: 'Aim for 7–9 hours of sleep. Poor sleep raises cortisol and increases diabetes risk.', category: 'Sleep' },
  { icon: 'leaf-outline' as const, tip: "Add leafy greens to your meals \u2014 they're rich in folate, iron, and antioxidants.", category: 'Nutrition' },
  { icon: 'sunny-outline' as const, tip: 'Get 15 minutes of morning sunlight to boost Vitamin D levels and regulate your body clock.', category: 'Wellness' },
  { icon: 'heart-outline' as const, tip: 'Deep breathing for 5 minutes reduces stress hormones and lowers resting heart rate.', category: 'Mindfulness' },
  { icon: 'barbell-outline' as const, tip: 'Strength training twice a week improves insulin sensitivity and bone density.', category: 'Fitness' },
];

function isIoniconsName(str?: string): boolean {
  if (!str) return false;
  return /^[a-z]+(-[a-z]+)*$/.test(str);
}

const actionCards = [
  {
    label: 'Upload Reports',
    icon: 'cloud-upload-outline' as const,
    desc: 'Add medical documents',
    route: '/upload',
    iconBg: '#E3F5C7',
    iconColor: '#5A8A2E',
  },
  {
    label: 'Talk to Medex',
    icon: 'mic-outline' as const,
    desc: 'AI health assistant',
    route: '/voice-chat',
    iconBg: '#E8F4FF',
    iconColor: '#2E6FAA',
  },
  {
    label: 'Predict Health Risk',
    icon: 'analytics-outline' as const,
    desc: 'Heart, BP & diabetes risk',
    route: '/health-predict',
    iconBg: '#FFF3E3',
    iconColor: '#AA6A2E',
  },
  {
    label: 'Medicine Reminder',
    icon: 'alarm-outline' as const,
    desc: 'Set daily reminders',
    route: '/medicine-reminder',
    iconBg: '#F3E3FF',
    iconColor: '#7A2EAA',
  },
];

function formatDate(raw?: string) {
  if (!raw) return '';
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  return `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
}

export default function DashboardScreen() {
  const [userName, setUserName] = useState('...');

  const [initials, setInitials] = useState('');
  const [recentDocs, setRecentDocs] = useState<UserDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [todaysTip, setTodaysTip] = useState<{
    title?: string;
    tip: string;
    emoji?: string;
    icon?: string;
    category?: string;
  }>(HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length]);

  useEffect(() => {
    async function fetchAndCacheTip() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const cachedDate = await SecureStore.getItemAsync('health_tip_cache_date');
        const cachedTipStr = await SecureStore.getItemAsync('health_tip_cached_data');

        if (cachedDate === todayStr && cachedTipStr) {
          setTodaysTip(JSON.parse(cachedTipStr));
          return;
        }

        const { data: dbTips, error } = await supabase
          .from('health_tips')
          .select('title, tip, emoji, category')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (dbTips && dbTips.length > 0) {
          const now = new Date();
          const localTimeMs = now.getTime() - now.getTimezoneOffset() * 60 * 1000;
          const daysSinceEpoch = Math.floor(localTimeMs / (24 * 60 * 60 * 1000));
          const tipIndex = daysSinceEpoch % dbTips.length;
          const selectedTip = dbTips[tipIndex];

          await SecureStore.setItemAsync('health_tip_cache_date', todayStr);
          await SecureStore.setItemAsync('health_tip_cached_data', JSON.stringify(selectedTip));
          setTodaysTip(selectedTip);
        }
      } catch (err) {
        console.error('Error loading health tip:', err);
      }
    }
    fetchAndCacheTip();
  }, []);

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
        {/* Today's Health Tip */}
        <View style={[styles.scoreBanner, { backgroundColor: '#E3F5C7' }]}>
          {/* Top row: icon + category badge */}
          <View style={styles.tipIconRow}>
            <View style={styles.tipIconBubble}>
              <Ionicons name={HEALTH_TIPS[new Date().getDay() % HEALTH_TIPS.length].icon} size={32} color="#5A8A2E" />
            </View>
          </View>

          {/* Body: grows to fill space */}
          <View style={styles.tipBody}>
            <Text style={styles.tipHeading}>Today's Health Tip</Text>
            <View style={styles.tipDivider} />
            {!!todaysTip.title && (
              <Text style={styles.tipTitleText}>{todaysTip.title}</Text>
            )}
            <Text style={styles.tipText}>{todaysTip.tip}</Text>
            {!!todaysTip.emoji && (
              <Text style={styles.tipEmoji}>{todaysTip.emoji}</Text>
            )}
          </View>

          {/* Footer: pinned to bottom */}
          <View style={styles.tipFooter}>
            <Ionicons name="calendar-outline" size={13} color="rgba(0,0,0,0.35)" />
            <Text style={styles.tipDate}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
          </View>
        </View>

        {/* Quick Action Cards */}
        <View style={styles.vitalsGrid}>
          {actionCards.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.vitalCard}
              onPress={() => router.push(a.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIconBubble, { backgroundColor: a.iconBg }]}>
                <Ionicons name={a.icon} size={22} color={a.iconColor} />
              </View>
              <Text style={[styles.vitalVal, { fontSize: 14, marginTop: 2 }]}>{a.label}</Text>
              <Text style={styles.vitalLabel}>{a.desc}</Text>
            </TouchableOpacity>
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
    borderRadius: 32, padding: 24,
    minHeight: 350,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  tipIconRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  tipIconBubble: { width: 64, height: 64, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.65)', alignItems: 'center', justifyContent: 'center' },
  tipBadge: { backgroundColor: 'rgba(255,255,255,0.75)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6 },
  tipBadgeText: { fontSize: 10, fontWeight: '800', color: '#5A8A2E', letterSpacing: 0.8 },
  tipBody: { flex: 1, gap: 10, paddingVertical: 16 },
  tipDivider: { height: 1.5, backgroundColor: 'rgba(90,138,46,0.2)', borderRadius: 1 },
  tipHeading: { fontSize: 16, fontWeight: '700', color: 'rgba(0,0,0,0.4)', letterSpacing: 1, textTransform: 'uppercase' },
  tipTitleText: { fontSize: 22, fontWeight: '800', color: '#18332F', lineHeight: 28 },
  tipText: { fontSize: 16, fontWeight: '500', color: '#3E5C56', lineHeight: 24 },
  tipEmoji: { fontSize: 32, marginTop: 4 },
  tipFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: 'rgba(90,138,46,0.15)' },
  tipDate: { fontSize: 12, color: 'rgba(0,0,0,0.4)', fontWeight: '500' },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalCard: {
    width: '48%', padding: 18, gap: 8, borderRadius: 24,
    borderWidth: 1, borderColor: Colors.gray[100], backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.09,
    shadowRadius: 12,
    elevation: 5,
  },
  vitalVal: { fontSize: 24, fontWeight: '800', color: Colors.gray[800], marginTop: 6 },
  vitalUnit: { fontSize: 12, color: Colors.gray[400], fontWeight: '500' },
  vitalLabel: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },
  actionIconBubble: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

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


});
