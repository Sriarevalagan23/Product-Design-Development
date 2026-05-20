import { Tabs, router, usePathname } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  Animated as RNAnimated,
  Easing,
  TouchableOpacity,
  ActivityIndicator,
  DeviceEventEmitter,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import React, { useState, useEffect, useRef } from 'react';

// ── Tab Icon Component ──────────────────────────────────────────────────────
function TabIcon({ icon, label, focused }: { icon: any; label: string; focused: boolean }) {
  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(focused ? 1.15 : 1, { duration: 200 }),
        },
      ],
    };
  });

  return (
    <View style={styles.tabItem}>
      <Animated.View style={animatedIconStyle}>
        <Ionicons
          name={icon}
          size={24}
          color={focused ? Colors.cloud[400] : Colors.gray[400]}
        />
      </Animated.View>
      <Text style={[styles.label, { color: focused ? Colors.cloud[400] : Colors.gray[400] }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// ── Pulse Rings Overlay ─────────────────────────────────────────────────────
function PulseRings({ active }: { active: boolean }) {
  const scale1 = useRef(new RNAnimated.Value(1)).current;
  const opacity1 = useRef(new RNAnimated.Value(0.6)).current;

  const scale2 = useRef(new RNAnimated.Value(1)).current;
  const opacity2 = useRef(new RNAnimated.Value(0.6)).current;

  useEffect(() => {
    if (active) {
      // Loop pulse 1
      RNAnimated.loop(
        RNAnimated.parallel([
          RNAnimated.timing(scale1, {
            toValue: 1.6,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          RNAnimated.timing(opacity1, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Loop pulse 2 (staggered by 800ms)
      const timeout = setTimeout(() => {
        RNAnimated.loop(
          RNAnimated.parallel([
            RNAnimated.timing(scale2, {
              toValue: 1.6,
              duration: 1600,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
            RNAnimated.timing(opacity2, {
              toValue: 0,
              duration: 1600,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, 800);

      return () => clearTimeout(timeout);
    } else {
      scale1.setValue(1);
      opacity1.setValue(0);
      scale2.setValue(1);
      opacity2.setValue(0);
    }
  }, [active]);

  return (
    <View style={StyleSheet.absoluteFill}>
      <RNAnimated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: scale1 }], opacity: opacity1 },
        ]}
      />
      <RNAnimated.View
        style={[
          styles.pulseRing,
          { transform: [{ scale: scale2 }], opacity: opacity2 },
        ]}
      />
    </View>
  );
}

// ── Main Layout ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  const pathname = usePathname();
  const isAiChat = pathname === '/ai-chat';

  // State shared from the AI Chat tab screen
  const [aiChatState, setAiChatState] = useState({
    listening: false,
    speaking: false,
    loading: false,
  });

  // Animated values for layout transitions
  const tabBarOpacity = useRef(new RNAnimated.Value(1)).current;
  const micTranslateY = useRef(new RNAnimated.Value(0)).current;
  const micScale = useRef(new RNAnimated.Value(1)).current;

  // Sync state transitions when pathname changes
  useEffect(() => {
    RNAnimated.parallel([
      RNAnimated.timing(tabBarOpacity, {
        toValue: isAiChat ? 0 : 1,
        duration: 350,
        useNativeDriver: true,
      }),
      RNAnimated.timing(micTranslateY, {
        toValue: isAiChat ? -110 : 0,
        duration: 450,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
      RNAnimated.timing(micScale, {
        toValue: isAiChat ? 1.25 : 1,
        duration: 450,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: true,
      }),
    ]).start();
  }, [isAiChat]);

  // Sync state updates from the AI Chat screen
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('ai-chat-state-change', (state) => {
      setAiChatState(state);
    });
    return () => sub.remove();
  }, []);

  const handleMicPress = () => {
    if (!isAiChat) {
      router.push('/ai-chat');
    } else {
      DeviceEventEmitter.emit('ai-chat-mic-press');
    }
  };

  const isMicActive = aiChatState.listening || aiChatState.speaking || aiChatState.loading;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => (
          <RNAnimated.View
            style={[
              styles.tabBarContainer,
              {
                opacity: tabBarOpacity,
              },
            ]}
            pointerEvents={isAiChat ? 'none' : 'auto'}
          >
            <BottomTabBar {...props} />
          </RNAnimated.View>
        )}
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'transparent',
            borderTopWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
            height: 64,
            paddingTop: 8,
            paddingHorizontal: 0,
          },
          tabBarShowLabel: false,
          tabBarItemStyle: {
            justifyContent: 'center',
            paddingTop: 0,
            paddingHorizontal: 0,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon={focused ? 'home' : 'home-outline'} label="Home" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon={focused ? 'document-text' : 'document-text-outline'} label="Reports" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="ai-chat"
          options={{
            tabBarIcon: () => <View style={{ width: 56 }} />, // Blank spacer for absolute overlay
          }}
        />
        <Tabs.Screen
          name="health-trends"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon={focused ? 'analytics' : 'analytics-outline'} label="Predict" focused={focused} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => <TabIcon icon={focused ? 'person' : 'person-outline'} label="Profile" focused={focused} />,
          }}
        />
      </Tabs>

      {/* Floating Center Button - Absolute Positioned Overlay */}
      <RNAnimated.View
        style={[
          styles.floatingWrap,
          {
            transform: [
              { translateY: micTranslateY },
              { scale: micScale },
            ],
            // Scale and adjust shadow depending on active state
            shadowColor: isAiChat ? 'rgba(0, 0, 0, 0.15)' : Colors.cloud[400],
            shadowRadius: isAiChat ? 12 : 10,
            shadowOpacity: isAiChat ? 0.2 : 0.3,
            elevation: isAiChat ? 14 : 8,
          },
        ]}
        pointerEvents="box-none"
      >
        {isAiChat && <PulseRings active={isMicActive} />}

        <View
          style={[
            styles.floatingHalo,
            {
              backgroundColor: 'rgba(170, 217, 99, 0.15)',
              borderColor: 'rgba(170, 217, 99, 0.3)',
              borderWidth: 1.5,
            },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleMicPress}
            style={styles.touchArea}
          >
            <View
              style={[
                styles.floatingBtn,
                {
                  backgroundColor: Colors.cloud[400],
                },
              ]}
            >
              {aiChatState.loading ? (
                <ActivityIndicator size="small" color={Colors.cloud[900]} />
              ) : (
                <Ionicons
                  name={aiChatState.listening ? 'square' : 'mic'}
                  size={26}
                  color={Colors.cloud[900]}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </RNAnimated.View>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    height: 64,
    borderRadius: 24,
    backgroundColor: Colors.cloud[800],
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    gap: 4,
  },
  label: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  floatingWrap: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    marginLeft: -37,
    width: 74,
    height: 74,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  floatingHalo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  pulseRing: {
    position: 'absolute',
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 2,
    borderColor: 'rgba(170, 217, 99, 0.5)',
    backgroundColor: 'rgba(170, 217, 99, 0.12)',
  },
});
