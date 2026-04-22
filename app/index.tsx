import { Colors, Gradients } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/(tabs)');
      }
    });

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <LinearGradient colors={Gradients.default} style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoInner}>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleWrap}>
          <Text style={styles.title}>Medex</Text>
          
        </View>

        <Text style={styles.tagline}>Store · Analyse · Predict</Text>
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttons, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.btnWhite} onPress={() => router.push('/onboarding')} activeOpacity={0.88}>
          <Text style={styles.btnWhiteText}>Get started</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={() => router.push('/login')} activeOpacity={0.8}>
          <Text style={styles.btnGhostText}>I have an account</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 32 },
  logoWrap: {
    width: 96, height: 96, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 10,
  },
  logoInner: { alignItems: 'center', justifyContent: 'center' },
  logoIcon: { fontSize: 42 },
  titleWrap: { alignItems: 'center', gap: 6 },
  title: { fontSize: 34, fontWeight: '700', color: Colors.white, letterSpacing: -0.5 , marginBottom: -15},
  tagline: { fontSize: 14, color: 'rgb(255, 255, 255)', letterSpacing: 2, marginTop: 2 },
  buttons: { paddingHorizontal: 24, paddingBottom: 48, gap: 12 },
  btnWhite: {
    backgroundColor: Colors.white, borderRadius: 99, paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 6,
  },
  btnWhiteText: { color: Colors.cloud[600], fontSize: 15, fontWeight: '700' },
  btnGhost: {
    borderRadius: 99, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  btnGhostText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
