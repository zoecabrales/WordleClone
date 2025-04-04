import { Stack } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useGameStore } from './store/gameStore';
import { useThemeStore } from './store/themeStore';
import { SplashScreen as CustomSplashScreen } from './components/SplashScreen';
import { View } from 'react-native';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const loadSavedStats = useGameStore(state => state.loadSavedStats);
  const initializeTheme = useThemeStore(state => state.initializeTheme);
  const { theme } = useThemeStore();

  useEffect(() => {
    let mounted = true;

    async function prepare() {
      try {
        // Hide the native splash screen first
        await SplashScreen.hideAsync();

        // Then load our resources
        await Promise.all([
          initializeTheme(),
          loadSavedStats()
        ]);

        if (mounted) {
          setIsLoaded(true);
        }
      } catch (e) {
        console.warn('[Layout] Failed to load saved theme:', e);
        if (mounted) {
          setIsLoaded(true);
        }
      }
    }

    prepare();

    return () => {
      mounted = false;
    };
  }, []);

  const handleAnimationComplete = async () => {
    // Add a small delay before showing the stack to ensure smooth transition
    setTimeout(() => {
      setShowStack(true);
    }, 100);
    setIsReady(true);
  };

  if (!isLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.background }} />;
  }

  if (!isReady) {
    return <CustomSplashScreen onAnimationComplete={handleAnimationComplete} />;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        {showStack && (
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: 'transparent',
              },
            }}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}
