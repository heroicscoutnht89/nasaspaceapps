import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useWindowDimensions } from 'react-native';
import { theme } from '../theme';
import { useEffect } from 'react';
import { syncAll } from '../data/sync';

export default function Layout() {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  useEffect(() => {
    syncAll();
    const timer = setInterval(syncAll, 60000);
    return () => clearInterval(timer);
    }, 
  []);
  
  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarPosition: wide ? 'left' : 'bottom',
          tabBarStyle: { backgroundColor: theme.colors.background, borderColor: theme.colors.border },
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.textMuted,
          tabBarIconStyle: { display: 'none' },
          sceneStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="checkin" options={{ title: 'Check-in' }} />
        <Tabs.Screen name="body" options={{ title: 'Body' }} />
        <Tabs.Screen name="radiation" options={{ title: 'Radiation' }} />
        <Tabs.Screen name="trends" options={{ title: 'Trends' }} />
        <Tabs.Screen name="report" options={{ title: 'Report' }} />
      </Tabs>
    </>
  );
}