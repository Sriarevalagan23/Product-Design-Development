import { Tabs, router } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBar } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

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

function FloatingAIIcon() {
  return (
    <View style={styles.floatingWrap}>
      <View style={styles.floatingHalo}>
        <View style={styles.floatingBtn}>
          <Ionicons name="mic" size={26} color={Colors.cloud[900]} />
        </View>
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => (
        <View style={styles.tabBarContainer}>
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
    top: -14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.cloud[400],
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingHalo: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'rgba(170, 217, 99, 0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(170, 217, 99, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.cloud[400],
  },
});
