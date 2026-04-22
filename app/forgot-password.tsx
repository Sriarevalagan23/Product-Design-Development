import { BtnPrimary, InputField } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Fixed back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={20} color={Colors.gray[700]} />
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Forgot password?</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a reset link.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <InputField
              label="Email address"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <BtnPrimary onPress={() => setSent(true)}>
              Send reset link
            </BtnPrimary>


          </View>


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  backBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.cloud[50],
    borderWidth: 1,
    borderColor: Colors.cloud[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 28,
  },
  header: {
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.gray[800],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[400],
    lineHeight: 22,
    textAlign: 'center',
  },
  form: { gap: 14 },
  successCard: {
    backgroundColor: Colors.cloud[50],
    borderColor: Colors.cloud[200],
    padding: 16,
  },
  successText: {
    fontSize: 13,
    color: Colors.cloud[700],
    lineHeight: 20,
    textAlign: 'center',
  },
  backLink: { alignItems: 'center', marginTop: 4 },
  backLinkText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.cloud[500],
  },
});
