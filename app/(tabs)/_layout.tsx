import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

function TabIcon({ emoji, label, focused }: { emoji: string; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.activeBar} />}
      <Text style={[styles.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
      <Text style={[styles.label, { color: focused ? Colors.cloud[500] : Colors.gray[400] }]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" label="Reports" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="health-trends"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" label="Health" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.cloud[100],
    borderTopWidth: 1,
    height: 72,
    paddingBottom: 8,
  },
  tabItem: { alignItems: 'center', gap: 2, paddingTop: 4 },
  activeBar: { width: 20, height: 3, backgroundColor: Colors.cloud[500], borderRadius: 2, marginBottom: 2 },
  emoji: { fontSize: 20 },
  label: { fontSize: 9, fontWeight: '700' },
});
