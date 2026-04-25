import { Badge, Card } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import React, { useEffect, useState } from 'react';
import {
  ScrollView, StyleSheet,
  Text, TouchableOpacity,
  View,
} from 'react-native';

const vitals = [
  { label: 'Blood Pressure', val: '118/76', unit: 'mmHg', badge: 'OK', type: 'green' as const },
  { label: 'Glucose', val: '108', unit: 'mg/dL', badge: 'Watch', type: 'yellow' as const },
  { label: 'Heart Rate', val: '72', unit: 'bpm', badge: 'OK', type: 'green' as const },
  { label: 'BMI', val: '22.4', unit: '', badge: 'OK', type: 'green' as const },
];

const recentReports = [
  { name: 'Blood test — CBC', date: '15 Mar 2026', badge: 'Normal', type: 'green' as const },
  { name: 'Lipid profile', date: '02 Mar 2026', badge: 'Review', type: 'yellow' as const },
];

const quickActions = [
  { label: 'Upload', emoji: '📤', route: '/upload' },
  { label: 'Predict', emoji: '🔬', route: '/enter-vitals' },
  { label: 'Trends', emoji: '📊', route: '/(tabs)/health-trends' },
];

export default function DashboardScreen() {
  const [userName, setUserName] = useState('...');
  const [initials, setInitials] = useState('');

  useEffect(() => {
    async function loadProfile() {
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
    if (hour < 18) return 'Good afternoon,';
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
            <LinearGradient colors={['#0a7aff', '#3a9bff']} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Health Score */}
        <LinearGradient colors={['#0a7aff', '#3a9bff', '#7bbcff']} style={styles.scoreBanner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View>
            <Text style={styles.scoreLabel}>Health Score</Text>
            <Text style={styles.scoreRating}>Good</Text>
            <Text style={styles.scoreTime}>Updated 2h ago</Text>
          </View>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreNum}>78</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
        </LinearGradient>

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

        {/* Recent Reports */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent reports</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/reports')} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {recentReports.map((r) => (
            <TouchableOpacity key={r.name} style={styles.reportRow} onPress={() => router.push('/report-detail')} activeOpacity={0.8}>
              <View style={styles.reportIcon}><Text>📄</Text></View>
              <View style={styles.reportInfo}>
                <Text style={styles.reportName}>{r.name}</Text>
                <Text style={styles.reportDate}>{r.date}</Text>
              </View>
              <Badge label={r.badge} type={r.type} />
            </TouchableOpacity>
          ))}
        </Card>

        {/* AI Assistant Strip */}
        <TouchableOpacity style={styles.aiStrip} onPress={() => router.push('/voice-chat')} activeOpacity={0.85}>
          <LinearGradient colors={['#0a7aff', '#3a9bff']} style={styles.aiIcon}>
            <Text style={{ fontSize: 18 }}>🎤</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiTitle}>Ask health assistant</Text>
            <Text style={styles.aiSub}>Tap to speak — AI powered</Text>
          </View>
          <Text style={styles.aiChevron}>›</Text>
        </TouchableOpacity>

        {/* Quick Actions */}
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
  container: { flex: 1, backgroundColor: Colors.cloud[50] },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.cloud[100],
  },
  greeting: { fontSize: 11, color: Colors.gray[400], fontWeight: '500' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.gray[800] },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  notifBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center' },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, backgroundColor: Colors.red[500], borderRadius: 4, borderWidth: 1.5, borderColor: Colors.white },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 12, fontWeight: '700' },

  scroll: { padding: 16, gap: 12, paddingBottom: 32 },

  scoreBanner: { borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 10, marginBottom: 4 },
  scoreRating: { color: Colors.white, fontSize: 24, fontWeight: '700' },
  scoreTime: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },
  scoreCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  scoreNum: { color: Colors.white, fontSize: 22, fontWeight: '700', lineHeight: 26 },
  scoreMax: { color: 'rgba(255,255,255,0.5)', fontSize: 9 },

  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  vitalCard: { width: '47.5%', padding: 12, gap: 4 },
  vitalVal: { fontSize: 18, fontWeight: '700', color: Colors.gray[800], marginTop: 4 },
  vitalUnit: { fontSize: 9, color: Colors.gray[400], fontWeight: '400' },
  vitalLabel: { fontSize: 9, color: Colors.gray[400] },

  sectionCard: { padding: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.gray[700] },
  seeAll: { fontSize: 11, color: Colors.cloud[500], fontWeight: '700' },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: Colors.cloud[50] },
  reportIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200], alignItems: 'center', justifyContent: 'center' },
  reportInfo: { flex: 1 },
  reportName: { fontSize: 11, fontWeight: '700', color: Colors.gray[800] },
  reportDate: { fontSize: 9, color: Colors.gray[400], marginTop: 2 },

  aiStrip: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.cloud[50], borderWidth: 1, borderColor: Colors.cloud[200], borderRadius: 20, padding: 14 },
  aiIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  aiTitle: { fontSize: 13, fontWeight: '700', color: Colors.cloud[700] },
  aiSub: { fontSize: 10, color: Colors.cloud[500], marginTop: 2 },
  aiChevron: { fontSize: 24, color: Colors.cloud[300] },

  quickGrid: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.cloud[200], borderRadius: 20, padding: 14, alignItems: 'center', gap: 6 },
  quickEmoji: { fontSize: 22 },
  quickLabel: { fontSize: 10, fontWeight: '700', color: Colors.gray[600] },
});
