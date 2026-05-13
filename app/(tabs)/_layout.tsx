import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

function TabIcon({ icon, label, focused }: { icon: any; label: string; focused: boolean }) {
  return (
    <View style={styles.tabItem}>
      <Ionicons
        name={icon}
        size={22}
        color={focused ? '#FFFFFF' : Colors.gray[400]}
      />
      <Text style={[styles.label, { color: focused ? '#FFFFFF' : Colors.gray[400] }]}>
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
  tabBar: {
    position: 'absolute',
    bottom: 20,
    left: 40,
    right: 40,
    backgroundColor: Colors.cloud[800],
    borderRadius: 24,
    borderTopWidth: 0,
    height: 60,
    paddingTop: 10,
    paddingHorizontal: 10,
    marginHorizontal: 10,
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
    width: 60,
    gap: 4,
  },
  label: { fontSize: 10, fontWeight: '600' },

});
