import { BtnPrimary, EyeIcon, EyeOffIcon, InputField } from '@/components/ui/MediComponents';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email validation regex
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailInvalid = email.length > 0 && !validateEmail(email);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Logo Section */}
        <Text style={styles.brandName}>Medex</Text>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View>
            <InputField
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={<Text style={{ fontSize: 18, color: Colors.cloud[500] }}>✉️</Text>}
            />
            {isEmailInvalid && <Text style={styles.errorText}>Invalid email format</Text>}
          </View>
          <InputField
            placeholder="Password"
            value={pass}
            onChangeText={setPass}
            secureTextEntry={!showPassword}
            icon={<Text style={{ fontSize: 18, color: Colors.cloud[500] }}>🔒</Text>}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                {showPassword ? <EyeIcon size={18} color={Colors.gray[500]} /> : <EyeOffIcon size={18} color={Colors.gray[500]} />}
              </TouchableOpacity>
            }
          />
          <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Sign In Button */}
        <BtnPrimary onPress={() => router.replace('/(tabs)')} style={styles.signInBtn}>
          Sign in →
        </BtnPrimary>

      

        {/* Register Link */}
        <Text style={styles.registerHint}>
          No account?{' '}
          <Text style={styles.registerLink} onPress={() => router.push('/register')}>Register</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 32,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0a7aff',
    letterSpacing: -0.5,
    textAlign: 'center',
    marginBottom: 16,
  },
  header: {
    gap: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  form: { gap: 14 },
  errorText: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: '#ef4444', 
    marginTop: 4,
  },
  forgot: { alignSelf: 'flex-end', marginTop: 4 },
  forgotText: { fontSize: 13, fontWeight: '700', color: Colors.cloud[500] },
  signInBtn: { marginTop: 8 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.cloud[100] },
  dividerText: { fontSize: 11, color: Colors.gray[400], fontWeight: '500' },
  socialRow: { flexDirection: 'row', gap: 12 },
  socialBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.cloud[200],
    borderRadius: 14,
    alignItems: 'center',
  },
  socialText: { fontSize: 14, fontWeight: '600', color: Colors.gray[700] },
  registerHint: { textAlign: 'center', fontSize: 14, color: Colors.gray[600], marginTop: 8 },
  registerLink: { color: Colors.cloud[500], fontWeight: '700' },
});
