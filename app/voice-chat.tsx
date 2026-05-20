import { TopBar } from '@/components/ui/MediComponents';
import { Colors, Gradients } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────
type Msg = { from: 'user' | 'ai'; text: string };

const EDGE_URL =
  'https://eoogmrwzzrhwxtctyxer.supabase.co/functions/v1/medex-chat';

const WELCOME: Msg = {
  from: 'ai',
  text: "Hi! I'm Medex AI 👋 I can help you understand your medical reports, answer health questions, and navigate your records. What would you like to know?",
};

// ── Animated waveform bars (listening state) ──────────────────────────────────
function WaveBar({ delay, active }: { delay: number; active: boolean }) {
  const anim = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (active) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: 28, duration: 500, delay, useNativeDriver: false }),
          Animated.timing(anim, { toValue: 8, duration: 500, useNativeDriver: false }),
        ]),
      ).start();
    } else {
      anim.stopAnimation();
      Animated.timing(anim, { toValue: 8, duration: 200, useNativeDriver: false }).start();
    }
  }, [active]);

  return <Animated.View style={[styles.waveBar, { height: anim }]} />;
}

// ── Typing indicator (three bouncing dots) ────────────────────────────────────
function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: -6, duration: 300, delay, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(400),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View style={[styles.typingDot, { transform: [{ translateY: anim }] }]} />
  );
}

function TypingIndicator() {
  return (
    <View style={styles.msgRow}>
      <View style={styles.aiAvatar}><Text style={styles.aiAvatarText}>M</Text></View>
      <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
        <TypingDot delay={0} />
        <TypingDot delay={150} />
        <TypingDot delay={300} />
      </View>
    </View>
  );
}

// ── Speaking pulse ring (TTS playback indicator) ──────────────────────────────
function SpeakingRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.25, duration: 700, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 700, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 700, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 700, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={[
        styles.speakingRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function VoiceChatScreen() {
  const { document_id } = useLocalSearchParams<{ document_id: string }>();

  const [msgs, setMsgs] = useState<Msg[]>([
    document_id
      ? { from: 'ai', text: 'I have your report ready! What would you like to know about it?' }
      : WELCOME,
  ]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Live partial transcript shown while user speaks
  const [transcript, setTranscript] = useState('');

  const [sessionId] = useState<string>(() =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }),
  );

  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // ── expo-speech-recognition events ────────────────────────────────────────
  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    const value = event.results[0]?.transcript ?? '';
    setTranscript(value);
    // When the result is final, auto-send it
    if (event.isFinal && value.trim()) {
      setListening(false);
      setTranscript('');
      sendText(value.trim());
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.warn('STT error:', event.error, event.message);
    setListening(false);
    setTranscript('');
    if (event.error !== 'no-speech') {
      Alert.alert('Voice Error', event.message || 'Could not recognise speech. Please try again.');
    }
  });

  // ── Request microphone permission & start STT ──────────────────────────────
  const startListening = useCallback(async () => {
    try {
      // Stop any ongoing TTS first
      if (speaking) {
        Speech.stop();
        setSpeaking(false);
      }

      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access in Settings to use voice input.',
        );
        return;
      }

      setTranscript('');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not start speech recognition.');
    }
  }, [speaking]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  }, []);

  // ── TTS helper ─────────────────────────────────────────────────────────────
  const speakReply = useCallback((text: string) => {
    // Strip markdown-style symbols that read awkwardly aloud
    const cleaned = text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#+ /g, '')
      .replace(/`/g, '')
      .trim();

    setSpeaking(true);
    Speech.speak(cleaned, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.92,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  // ── Call Edge Function ─────────────────────────────────────────────────────
  const sendText = useCallback(
    async (text: string) => {
      if (!text || loading) return;

      setMsgs((prev) => [...prev, { from: 'user', text }]);
      setInput('');
      setLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const res = await fetch(EDGE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ message: text, session_id: sessionId, document_id }),
        });

        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || 'Edge function error');

        const reply: string = json.message;
        setMsgs((prev) => [...prev, { from: 'ai', text: reply }]);

        // Speak the AI reply aloud
        speakReply(reply);
      } catch (err: any) {
        const errMsg = "Sorry, I couldn't reach the server right now. Please try again.";
        setMsgs((prev) => [...prev, { from: 'ai', text: errMsg }]);
      } finally {
        setLoading(false);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [loading, sessionId, document_id, speakReply],
  );

  // Convenience wrapper for text-input send
  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendText(text);
  }, [input, sendText]);

  // Scroll to bottom whenever messages / loading state changes
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs, loading]);

  // ── Listening full-screen overlay ──────────────────────────────────────────
  if (listening) {
    return (
      <View style={styles.container}>
        <TopBar title="Health assistant" onBack={stopListening} />
        <View style={styles.listeningCenter}>
          <Text style={styles.listeningHint}>Listening…</Text>

          {/* Mic button with pulse rings */}
          <View style={styles.micRing}>
            <View style={styles.micMid}>
              <LinearGradient colors={Gradients.default} style={styles.micInner}>
                <Ionicons name="mic" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
          </View>

          {/* Live waveform */}
          <View style={styles.waveRow}>
            {[0, 150, 300, 450, 600, 750, 900].map((d) => (
              <WaveBar key={d} delay={d} active={listening} />
            ))}
          </View>

          {/* Live transcript preview */}
          <Text style={styles.listeningQuote} numberOfLines={3}>
            {transcript ? `"${transcript}"` : '"What would you like to ask?"'}
          </Text>

          <Text style={styles.listeningTip}>Tap the button to stop</Text>

          <TouchableOpacity style={styles.cancelBtn} onPress={stopListening} activeOpacity={0.8}>
            <Text style={styles.cancelText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Chat UI ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.container}>
      {/* TopBar is OUTSIDE KAV so it stays fixed when keyboard opens */}
      <TopBar title="Health assistant" onBack={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.chatScroll}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {msgs.map((m, i) => (
            <View
              key={i}
              style={[styles.msgRow, m.from === 'user' ? styles.msgRight : styles.msgLeft]}
            >
              {m.from === 'ai' && (
                <View style={styles.aiAvatar}>
                  <Text style={styles.aiAvatarText}>M</Text>
                </View>
              )}
              <View
                style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleAI]}
              >
                <Text style={[styles.bubbleText, { color: Colors.gray[800] }]}>{m.text}</Text>
              </View>
            </View>
          ))}

          {loading && <TypingIndicator />}
        </ScrollView>

        {/* ── Input bar ──────────────────────────────────────────────────── */}
        <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>

          {/* Speaker / mute button — shown when AI is speaking */}
          {speaking && (
            <TouchableOpacity
              onPress={stopSpeaking}
              activeOpacity={0.8}
              style={styles.speakerBtn}
            >
              <View style={styles.speakerBtnInner}>
                <SpeakingRing />
                <Ionicons name="volume-high" size={18} color={Colors.cloud[600]} />
              </View>
            </TouchableOpacity>
          )}

          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={send}
            placeholder="Ask about your health records…"
            placeholderTextColor={Colors.gray[400]}
            style={styles.textInput}
            returnKeyType="send"
            editable={!loading}
          />

          {/* Send button — shown when there is text */}
          {input.trim().length > 0 ? (
            <TouchableOpacity onPress={send} activeOpacity={0.85} disabled={loading}>
              <LinearGradient colors={Gradients.default} style={styles.micBtn}>
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons name="send" size={18} color={Colors.white} />
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* Mic button — tap to start listening */
            <TouchableOpacity onPress={startListening} activeOpacity={0.85} disabled={loading}>
              <LinearGradient colors={Gradients.default} style={styles.micBtn}>
                <Ionicons name="mic" size={20} color={Colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  chatScroll: { padding: 16, gap: 12, paddingBottom: 8 },

  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  msgRight: { justifyContent: 'flex-end' },
  msgLeft: { justifyContent: 'flex-start' },

  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.cloud[800],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aiAvatarText: { fontSize: 14, fontWeight: '800', color: Colors.white },

  bubble: { maxWidth: '75%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: Colors.cloud[100], borderBottomRightRadius: 4 },
  bubbleAI: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 19 },

  // Typing indicator
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.cloud[400] },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    backgroundColor: Colors.white,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: 99,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.gray[700],
  },
  micBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  // Speaker (TTS playing) button
  speakerBtn: { position: 'relative', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  speakerBtnInner: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  speakingRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.cloud[400],
  },

  // Listening screen
  listeningCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  listeningHint: { fontSize: 13, color: Colors.gray[500], fontWeight: '500' },
  micRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  micMid: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  micInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 5, height: 36 },
  waveBar: { width: 4, backgroundColor: Colors.cloud[400], borderRadius: 2 },
  listeningQuote: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.gray[800],
    textAlign: 'center',
  },
  listeningTip: { fontSize: 11, color: Colors.gray[400] },
  cancelBtn: {
    borderRadius: 99,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  cancelText: { fontSize: 13, fontWeight: '600', color: Colors.cloud[500] },
});
