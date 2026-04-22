import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { InputField, BtnPrimary, TopBar, Card } from '@/components/ui/MediComponents';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <View style={styles.container}>
      <TopBar title="Forgot password" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Reset your password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send a reset link.</Text>
        </View>

        <InputField
          label="Email address"
          placeholder="you@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <BtnPrimary onPress={() => setSent(true)}>Send reset link</BtnPrimary>

        {sent && (
          <Card style={styles.successCard}>
            <Text style={styles.successText}>✅ Link sent! Check your inbox (and spam). Expires in 30 minutes.</Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 18 },
  header: { gap: 6 },
  title: { fontSize: 22, fontWeight: '700', color: Colors.gray[800] },
  subtitle: { fontSize: 13, color: Colors.gray[500], lineHeight: 20 },
  successCard: { backgroundColor: Colors.cloud[50], borderColor: Colors.cloud[200], padding: 16 },
  successText: { fontSize: 12, color: Colors.cloud[700], lineHeight: 18 },
});
