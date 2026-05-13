import { TopBar } from '@/components/ui/MediComponents';
import { Colors, Gradients } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, KeyboardAvoidingView, Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type Msg = { from: 'user' | 'ai'; text: string };

const initial: Msg[] = [
  { from: 'user', text: 'What does my latest report say?' },
  { from: 'ai', text: 'Your blood test (15 Mar) shows normal haemoglobin and WBC. All values are healthy — no anaemia or infection signs.' },
  { from: 'user', text: 'What is haemoglobin?' },
  { from: 'ai', text: "Haemoglobin carries oxygen through your blood. Normal range: 12–17 g/dL for adults. Yours is 14.2 — excellent!" },
];

// Animated waveform bars for "listening" state
function WaveBar({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(8)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 28, duration: 600, delay, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 8, duration: 600, useNativeDriver: false }),
      ]),
    ).start();
  }, []);
  return <Animated.View style={[styles.waveBar, { height: anim }]} />;
}

export default function VoiceChatScreen() {
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  const send = () => {
    if (!input.trim()) return;
    const next: Msg[] = [...msgs, { from: 'user', text: input }];
    setMsgs(next);
    setInput('');
    setTimeout(() => {
      setMsgs((m) => [...m, { from: 'ai', text: "I'm analysing your health records. Please give me a moment to provide an accurate response based on your data." }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 800);
  };
  if (listening) {
    return (
      <View style={styles.container}>
        <TopBar title="Health assistant" onBack={() => setListening(false)} />
        <View style={styles.listeningCenter}>
          <Text style={styles.listeningHint}>Listening…</Text>
          <View style={styles.micRing}>
            <View style={styles.micMid}>
              <LinearGradient colors={Gradients.default} style={styles.micInner}>
                <Ionicons name="mic" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
          </View>
          <View style={styles.waveRow}>
            {[0, 150, 300, 450, 600, 750, 900].map((d) => (
              <WaveBar key={d} delay={d} />
            ))}
          </View>
          <Text style={styles.listeningQuote}>"What are my latest results?"</Text>
          <Text style={styles.listeningTip}>Tap mic again to stop</Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => setListening(false)} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TopBar title="Health assistant" onBack={() => router.back()} />

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatScroll}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {msgs.map((m, i) => (
            <View key={i} style={[styles.msgRow, m.from === 'user' ? styles.msgRight : styles.msgLeft]}>
              {m.from === 'ai' && (
                <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>M</Text></View>
              )}
              <View style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={[styles.bubbleText, { color: Colors.gray[800] }]}>
                  {m.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            placeholder="Type or tap mic…"
            placeholderTextColor={Colors.gray[400]}
            style={styles.textInput}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={() => setListening(true)} activeOpacity={0.85}>
            <LinearGradient colors={Gradients.default} style={styles.micBtn}>
              <Ionicons name="mic" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  chatScroll: { padding: 16, gap: 12, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRight: { justifyContent: 'flex-end' },
  msgLeft: { justifyContent: 'flex-start' },
  aiAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.cloud[800], alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  aiAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.white },
  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: Colors.cloud[100], borderBottomRightRadius: 4 },
  bubbleAI: { backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[200], borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 19 },
  inputBar: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: Colors.gray[100], backgroundColor: Colors.white },
  textInput: { flex: 1, backgroundColor: Colors.white, borderWidth: 1, borderColor: Colors.gray[200], borderRadius: 99, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13, color: Colors.gray[700] },
  micBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  listeningCenter: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingHorizontal: 40 },
  listeningHint: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },
  micRing: { width: 112, height: 112, borderRadius: 56, borderWidth: 1, borderColor: Colors.gray[100], alignItems: 'center', justifyContent: 'center' },
  micMid: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: Colors.gray[200], alignItems: 'center', justifyContent: 'center' },
  micInner: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 36 },
  waveBar: { width: 4, backgroundColor: Colors.cloud[400], borderRadius: 2 },
  listeningQuote: { fontSize: 16, fontWeight: '700', color: Colors.gray[800], textAlign: 'center' },
  listeningTip: { fontSize: 11, color: Colors.gray[400] },
  cancelBtn: { borderRadius: 99, paddingVertical: 14, paddingHorizontal: 40, borderWidth: 1, borderColor: Colors.gray[200] },
  cancelText: { fontSize: 13, fontWeight: '600', color: Colors.cloud[500] },
});
