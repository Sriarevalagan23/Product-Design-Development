import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Gradients } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

function TabIcon({ icon, label, focused }: { icon: any; label: string; focused: boolean }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withTiming(focused ? 1.15 : 1, { duration: 250 }),
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.tabItem, animatedStyle]}>
      <Ionicons
        name={icon}
        size={22}
        color={focused ? '#FFFFFF' : Colors.gray[400]}
      />
      <Text style={[styles.label, { color: focused ? '#FFFFFF' : Colors.gray[400] }]} numberOfLines={1} adjustsFontSizeToFit>
        {label}
      </Text>
    </Animated.View>
  );
}

function FloatingAIIcon() {
  return (
    <View style={styles.floatingWrap}>
      <View style={styles.floatingBtn}>
        <Ionicons name="mic" size={28} color={Colors.cloud[900]} />
      </View>
    </View>
  );
}

function TabBarBackground() {
  return (
    <View style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}>
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.cloud[800],
          borderTopLeftRadius: 24,
          borderBottomLeftRadius: 24,
        }}
      />

      <View style={{ width: 100, height: 60 }}>
        <Svg width={100} height={60} viewBox="0 0 100 60">
          <Path
            d="
              M 0 0
              C 20 0, 15 36, 50 36
              C 85 36, 80 0, 100 0
              L 100 60
              L 0 60
              Z
            "
            fill={Colors.cloud[800]}
          />
        </Svg>
      </View>

      <View
        style={{
          flex: 1,
          backgroundColor: Colors.cloud[800],
          borderTopRightRadius: 24,
          borderBottomRightRadius: 24,
        }}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = width - 20;
const TAB_ITEM_WIDTH = (TAB_BAR_WIDTH - 20) / 5;

function SlidingIndicator({ activeIndex }: { activeIndex: number }) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(10 + activeIndex * TAB_ITEM_WIDTH, {
            duration: 250,
          }),
        },
      ],
    };
  });

  return <Animated.View style={[styles.slidingPill, animatedStyle]} />;
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.tabBarContainer}>
          <TabBarBackground />
          <SlidingIndicator activeIndex={props.state.index} />
          <BottomTabBar {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 60,
          paddingTop: 10,
          paddingHorizontal: 10,
        },
        tabBarShowLabel: false,
        tabBarItemStyle: {
          justifyContent: 'center',
          paddingTop: 0,
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
          tabBarIcon: () => <FloatingAIIcon />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/voice-chat');
          },
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
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    right: 10,
    height: 60,
    borderRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  slidingPill: {
    position: 'absolute',
    left: 0,
    top: 3,
    width: TAB_ITEM_WIDTH,
    height: 55,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    gap: 4,
  },
  label: { fontSize: 10, fontWeight: '600', textAlign: 'center' },
  floatingWrap: {
    top: -22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cloud[400],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cloud[400],
  },
});
