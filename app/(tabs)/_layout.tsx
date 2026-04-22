import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ icon, label, focused }: { icon: any; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      {focused && <View style={styles.activeBar} />}
      <Ionicons
        name={icon}
        size={24}
        color={focused ? Colors.cloud[500] : Colors.gray[400]}
      />
      <Text style={[styles.label, { color: focused ? Colors.cloud[500] : Colors.gray[400] }]}>
        {label}
      </Text>
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
        name="health-trends"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon icon={focused ? 'analytics' : 'analytics-outline'} label="Health" focused={focused} />,
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
  tabBar: {
    backgroundColor: Colors.white,
    borderTopColor: Colors.cloud[100],
    borderTopWidth: 1,
    height: 84, // Slightly taller for comfortable tap targets
    paddingBottom: 24, // Padding to push it above the home indicator
    paddingTop: 8,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64, // Stops labels like "Reports" from wrapping
    gap: 4,
  },
  activeBar: {
    position: 'absolute',
    top: -8, // Push to the top edge of the tab bar
    width: 24,
    height: 4,
    backgroundColor: Colors.cloud[500],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  label: { fontSize: 10, fontWeight: '600' },
});
