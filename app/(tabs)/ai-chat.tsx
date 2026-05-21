import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  DeviceEventEmitter,
  ScrollView,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const AnimatedPath = Animated.createAnimatedComponent(Path) as any;

const EDGE_URL = 'https://eoogmrwzzrhwxtctyxer.supabase.co/functions/v1/medex-chat';

// ── Animated waveform component (app accent colors for light background) ──────
interface WaveformProps {
  active: boolean;
  voiceVolume: Animated.Value;
}

function Waveform({ active, voiceVolume }: WaveformProps) {
  const phase1 = useRef(new Animated.Value(0)).current;
  const phase2 = useRef(new Animated.Value(0)).current;
  const phase3 = useRef(new Animated.Value(0)).current;
  const activeScale = useRef(new Animated.Value(0.2)).current;

  // Horizontal scroll + vertical scale — both tied to active state
  useEffect(() => {
    if (active) {
      const loop1 = Animated.loop(
        Animated.timing(phase1, {
          toValue: -150,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      const loop2 = Animated.loop(
        Animated.timing(phase2, {
          toValue: -150,
          duration: 2600,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      const loop3 = Animated.loop(
        Animated.timing(phase3, {
          toValue: -150,
          duration: 3200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      loop1.start();
      loop2.start();
      loop3.start();

      Animated.timing(activeScale, {
        toValue: 1.0,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();

      return () => {
        loop1.stop();
        loop2.stop();
        loop3.stop();
      };
    } else {
      Animated.timing(activeScale, {
        toValue: 0.2,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [active]);

  // Combine baseline scale and voice volume height
  const scaleY = Animated.multiply(
    activeScale,
    voiceVolume.interpolate({
      inputRange: [0, 1],
      outputRange: [0.18, 1.4],
    })
  );

  return (
    <Animated.View style={[styles.waveContainer, { transform: [{ scaleY }], overflow: 'hidden' }]}>
      <Svg
        width="100%"
        height="150"
        viewBox="0 0 300 150"
        style={StyleSheet.absoluteFill}
      >
        {/* Wave 1: Brand Accent Lime Green Glow & Core
            Path extends from -900 to 1500 (14 full periods × 150 units)
            Loop resets every -150 units — perfectly seamless */}
        <AnimatedPath
          d="M -900 75 C -825 10,-825 140,-750 75 C -675 10,-675 140,-600 75 C -525 10,-525 140,-450 75 C -375 10,-375 140,-300 75 C -225 10,-225 140,-150 75 C -75 10,-75 140,0 75 C 75 10,75 140,150 75 C 225 10,225 140,300 75 C 375 10,375 140,450 75 C 525 10,525 140,600 75 C 675 10,675 140,750 75 C 825 10,825 140,900 75 C 975 10,975 140,1050 75 C 1125 10,1125 140,1200 75 C 1275 10,1275 140,1350 75 C 1425 10,1425 140,1500 75"
          fill="none"
          stroke="rgba(170, 217, 99, 0.35)"
          strokeWidth="9"
          style={{ transform: [{ translateX: phase1 }] }}
        />
        <AnimatedPath
          d="M -900 75 C -825 10,-825 140,-750 75 C -675 10,-675 140,-600 75 C -525 10,-525 140,-450 75 C -375 10,-375 140,-300 75 C -225 10,-225 140,-150 75 C -75 10,-75 140,0 75 C 75 10,75 140,150 75 C 225 10,225 140,300 75 C 375 10,375 140,450 75 C 525 10,525 140,600 75 C 675 10,675 140,750 75 C 825 10,825 140,900 75 C 975 10,975 140,1050 75 C 1125 10,1125 140,1200 75 C 1275 10,1275 140,1350 75 C 1425 10,1425 140,1500 75"
          fill="none"
          stroke="rgba(134, 185, 56, 0.95)"
          strokeWidth="2.5"
          style={{ transform: [{ translateX: phase1 }] }}
        />

        {/* Wave 2: Brand Dark Forest Green Glow & Core */}
        <AnimatedPath
          d="M -900 75 C -825 120,-825 30,-750 75 C -675 120,-675 30,-600 75 C -525 120,-525 30,-450 75 C -375 120,-375 30,-300 75 C -225 120,-225 30,-150 75 C -75 120,-75 30,0 75 C 75 120,75 30,150 75 C 225 120,225 30,300 75 C 375 120,375 30,450 75 C 525 120,525 30,600 75 C 675 120,675 30,750 75 C 825 120,825 30,900 75 C 975 120,975 30,1050 75 C 1125 120,1125 30,1200 75 C 1275 120,1275 30,1350 75 C 1425 120,1425 30,1500 75"
          fill="none"
          stroke="rgba(13, 28, 26, 0.12)"
          strokeWidth="11"
          style={{ transform: [{ translateX: phase2 }] }}
        />
        <AnimatedPath
          d="M -900 75 C -825 120,-825 30,-750 75 C -675 120,-675 30,-600 75 C -525 120,-525 30,-450 75 C -375 120,-375 30,-300 75 C -225 120,-225 30,-150 75 C -75 120,-75 30,0 75 C 75 120,75 30,150 75 C 225 120,225 30,300 75 C 375 120,375 30,450 75 C 525 120,525 30,600 75 C 675 120,675 30,750 75 C 825 120,825 30,900 75 C 975 120,975 30,1050 75 C 1125 120,1125 30,1200 75 C 1275 120,1275 30,1350 75 C 1425 120,1425 30,1500 75"
          fill="none"
          stroke="rgba(21, 46, 42, 0.85)"
          strokeWidth="1.5"
          style={{ transform: [{ translateX: phase2 }] }}
        />

        {/* Wave 3: Brand Medium Teal Glow & Core */}
        <AnimatedPath
          d="M -900 75 C -850 30,-800 120,-750 75 C -700 30,-650 120,-600 75 C -550 30,-500 120,-450 75 C -400 30,-350 120,-300 75 C -250 30,-200 120,-150 75 C -100 30,-50 120,0 75 C 50 30,100 120,150 75 C 200 30,250 120,300 75 C 350 30,400 120,450 75 C 500 30,550 120,600 75 C 650 30,700 120,750 75 C 800 30,850 120,900 75 C 950 30,1000 120,1050 75 C 1100 30,1150 120,1200 75 C 1250 30,1300 120,1350 75 C 1400 30,1450 120,1500 75"
          fill="none"
          stroke="rgba(77, 182, 172, 0.25)"
          strokeWidth="6"
          style={{ transform: [{ translateX: phase3 }] }}
        />
        <AnimatedPath
          d="M -900 75 C -850 30,-800 120,-750 75 C -700 30,-650 120,-600 75 C -550 30,-500 120,-450 75 C -400 30,-350 120,-300 75 C -250 30,-200 120,-150 75 C -100 30,-50 120,0 75 C 50 30,100 120,150 75 C 200 30,250 120,300 75 C 350 30,400 120,450 75 C 500 30,550 120,600 75 C 650 30,700 120,750 75 C 800 30,850 120,900 75 C 950 30,1000 120,1050 75 C 1100 30,1150 120,1200 75 C 1250 30,1300 120,1350 75 C 1400 30,1450 120,1500 75"
          fill="none"
          stroke="rgba(0, 150, 136, 0.85)"
          strokeWidth="2.5"
          style={{ transform: [{ translateX: phase3 }] }}
        />
      </Svg>
    </Animated.View>
  );
}

// ── Main Tab Screen ─────────────────────────────────────────────────────────
export default function AiChatTab() {
  const insets = useSafeAreaInsets();
  const [displayText, setDisplayText] = useState("Hi! I'm Medex AI. Tap the microphone below to ask me anything about your health records.");
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Animated voice volume representation
  const voiceVolume = useRef(new Animated.Value(0)).current;

  const [sessionId] = useState<string>(() =>
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    })
  );

  // Notify layout about state changes so the navbar button can respond
  useEffect(() => {
    DeviceEventEmitter.emit('ai-chat-state-change', { listening, speaking, loading });
  }, [listening, speaking, loading]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
      ExpoSpeechRecognitionModule.stop();
      DeviceEventEmitter.emit('ai-chat-state-change', { listening: false, speaking: false, loading: false });
    };
  }, []);

  // ── Speech event handlers ──────────────────────────────────────────────────
  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));

  useSpeechRecognitionEvent('result', (event) => {
    const value = event.results[0]?.transcript ?? '';
    setTranscript(value);
    setDisplayText(value);
    if (event.isFinal && value.trim()) {
      setListening(false);
      setTranscript('');
      sendText(value.trim());
    }
  });

  // Track mic volume level changes for dynamic pulsing
  useSpeechRecognitionEvent('volumechange', (event) => {
    const db = event.value;
    // Map db values (typically -2 to 10) to a normalized [0, 1] range
    const normalized = Math.max(0, Math.min(1, (db + 2) / 10));
    Animated.timing(voiceVolume, {
      toValue: normalized,
      duration: 40,
      useNativeDriver: true,
    }).start();
  });

  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    setTranscript('');
    if (event.error !== 'no-speech') {
      Alert.alert('Voice Error', event.message || 'Could not recognize speech.');
    }
  });

  // Animate thinking state (slow steady breathing pulse)
  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (loading) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(voiceVolume, {
            toValue: 0.5,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(voiceVolume, {
            toValue: 0.15,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
    }
    return () => {
      animation?.stop();
    };
  }, [loading, voiceVolume]);

  // Animate speaking state (simulated voice pulse waves)
  useEffect(() => {
    let interval: any;
    if (speaking) {
      const pulse = () => {
        const randomVolume = 0.35 + Math.random() * 0.65;
        Animated.timing(voiceVolume, {
          toValue: randomVolume,
          duration: 90,
          useNativeDriver: true,
        }).start();
      };
      pulse();
      interval = setInterval(pulse, 120);
    } else if (!listening && !loading) {
      // Quiet/idle state
      Animated.timing(voiceVolume, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speaking, listening, loading, voiceVolume]);

  const startListening = useCallback(async () => {
    try {
      if (speaking) {
        Speech.stop();
        setSpeaking(false);
      }

      const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        Alert.alert(
          'Microphone Permission',
          'Please allow microphone access in Settings to use voice input.'
        );
        return;
      }

      setTranscript('');
      setDisplayText('Listening…');
      ExpoSpeechRecognitionModule.start({
        lang: 'en-US',
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        volumeChangeEventOptions: {
          enabled: true,
          intervalMillis: 40, // Capture volume level changes quickly
        },
      });
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not start speech recognition.');
    }
  }, [speaking]);

  const stopListening = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
    setListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    Speech.stop();
    setSpeaking(false);
  }, []);

  const speakReply = useCallback((text: string) => {
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
      rate: 0.95,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, []);

  const sendText = useCallback(
    async (text: string) => {
      if (!text || loading) return;

      setLoading(true);
      setDisplayText('Thinking…');

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
          body: JSON.stringify({ message: text, session_id: sessionId }),
        });

        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || 'Edge function error');

        const reply: string = json.message;
        setDisplayText(reply);
        speakReply(reply);
      } catch (err: any) {
        const errMsg = "Sorry, I couldn't reach the server right now. Please try again.";
        setDisplayText(errMsg);
      } finally {
        setLoading(false);
      }
    },
    [loading, sessionId, speakReply]
  );

  const handleMicPress = useCallback(() => {
    if (listening) {
      stopListening();
    } else if (speaking) {
      stopSpeaking();
    } else {
      startListening();
    }
  }, [listening, speaking, startListening, stopListening, stopSpeaking]);

  // Listen for the mic press event triggered from the absolute layout button
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('ai-chat-mic-press', handleMicPress);
    return () => sub.remove();
  }, [handleMicPress]);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 330 }]}>
      {/* Top light-green fade gradient */}
      <LinearGradient
        colors={['rgba(214, 238, 165, 0.55)', 'rgba(214, 238, 165, 0.12)', 'rgba(255, 255, 255, 0)']}
        locations={[0, 0.5, 1]}
        style={styles.topGradient}
        pointerEvents="none"
      />

      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => {
            Speech.stop();
            ExpoSpeechRecognitionModule.stop();
            router.replace('/');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={20} color="#151717" />
        </TouchableOpacity>
      </View>

      {/* Main Text Content */}
      <View style={styles.textContainer}>
        <ScrollView contentContainerStyle={styles.scrollTextContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.assistantText}>
            {displayText}
          </Text>
        </ScrollView>
        {/* Bottom fade gradient to fade text above the waveform */}
        <LinearGradient
          colors={['rgba(255, 255, 255, 0)', '#ffffff']}
          style={styles.bottomFade}
          pointerEvents="none"
        />
      </View>

      {/* Waveform Visualization (directly on the screen's white background) */}
      <View style={styles.waveformWrapper}>
        <Waveform active={listening || speaking || loading} voiceVolume={voiceVolume} />
      </View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    zIndex: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 16,
    height: 60,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  scrollTextContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 90,
  },
  assistantText: {
    fontSize: 22,
    lineHeight: 34,
    fontWeight: '400',
    color: '#151717',
    textAlign: 'left',
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  waveformWrapper: {
    position: 'absolute',
    bottom: 210,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveContainer: {
    width: '100%',
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
