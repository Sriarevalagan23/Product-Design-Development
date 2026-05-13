import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* ... existing screens ... */}
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="report-detail" />
        <Stack.Screen name="upload" />
        <Stack.Screen name="scan-doc" />
        <Stack.Screen name="ocr-preview" />
        <Stack.Screen name="enter-vitals" />
        <Stack.Screen name="prediction-result" />
        <Stack.Screen name="voice-chat" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="settings" />
        <Stack.Screen name="change-password" />
        <Stack.Screen name="search" />
        <Stack.Screen name="about" />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
