import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

import CustomSplashScreen from '../components/SplashScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hilangkan native splash secepat mungkin
    SplashScreen.hideAsync().catch(() => {});

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <CustomSplashScreen />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}