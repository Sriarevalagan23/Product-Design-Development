import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Badge, Card, BtnSecondary, BtnOutline } from '@/components/ui/MediComponents';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<{ 
    full_name: string; 
    email: string; 
    dob: string; 
    blood_group: string;
    phone?: string;
    height?: number;
    weight?: number;
    allergies?: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      }
    }
    loadProfile();
  }, []);

  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(profile?.full_name);
  const name = profile?.full_name || 'User';
  const email = profile?.email || '';

  const info = [
    { l: 'Date of birth',      v: profile?.dob || '-' },
    { l: 'Blood group',        v: profile?.blood_group || '-' },
    { l: 'Height / Weight',    v: profile?.height || profile?.weight ? `${profile?.height || '-'} cm / ${profile?.weight || '-'} kg` : '-' },
    { l: 'Allergies',          v: profile?.allergies || '-' },
    { l: 'Emergency contact',  v: profile?.phone || '-' },
  ];

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      // Clear image cache on sign out
      await Promise.all([
        Image.clearMemoryCache(),
        Image.clearDiskCache()
      ]);
    } catch (e) {
      console.error('Error during sign out:', e);
    } finally {
      router.replace('/login');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity onPress={() => router.push('/edit-profile')} activeOpacity={0.7}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar card */}
        <Card style={styles.avatarCard}>
          <LinearGradient colors={['#E3F5C7', '#E3F5C7']} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </LinearGradient>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
          <Badge label="Patient" type="blue" />
        </Card>

        {/* Info card */}
        <Text style={styles.sectionLabel}>PERSONAL INFO</Text>
        <Card style={styles.infoCard}>
          {info.map(({ l, v }) => (
            <View key={l} style={styles.infoRow}>
              <Text style={styles.infoKey}>{l}</Text>
              <Text style={styles.infoVal}>{v}</Text>
            </View>
          ))}
        </Card>

        {/* Actions Card */}
        <Card style={styles.actionCard}>
          <TouchableOpacity style={styles.listRow} activeOpacity={0.7} onPress={() => {}}>
            <Text style={styles.listRowText}>Download my records</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listRow, styles.borderTop]} activeOpacity={0.7} onPress={() => router.push('/about')}>
            <Text style={styles.listRowText}>About & help</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listRow, styles.borderTop]} activeOpacity={0.7} onPress={() => router.push('/settings')}>
            <Text style={styles.listRowText}>Settings</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listRow, styles.borderTop]} activeOpacity={0.7} onPress={handleSignOut}>
            <Text style={[styles.listRowText, { color: Colors.red[500] }]}>Sign out</Text>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 14,
    backgroundColor: Colors.white,
  },
  headerTitle: { fontSize: 28, fontWeight: '800', color: Colors.gray[800], letterSpacing: -0.6 },
  editText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  scroll: { padding: 16, gap: 12, paddingBottom: 110 },
  avatarCard: { padding: 24, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  avatar: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#18332F', fontSize: 22, fontWeight: '700' },
  name: { fontSize: 20, fontWeight: '700', color: Colors.gray[800] },
  email: { fontSize: 11, color: Colors.gray[400] },
  infoCard: { paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gray[200], backgroundColor: Colors.white },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: Colors.gray[400], letterSpacing: 1, marginTop: 12, marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  infoKey: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },
  infoVal: { fontSize: 13, fontWeight: '700', color: Colors.gray[800] },
  actionCard: { paddingHorizontal: 16, paddingVertical: 4, borderWidth: 1, borderColor: Colors.gray[200] },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.white },
  listRowText: { fontSize: 13, color: Colors.gray[700], fontWeight: '600' },
  chevron: { fontSize: 20, color: Colors.gray[400] },
});
