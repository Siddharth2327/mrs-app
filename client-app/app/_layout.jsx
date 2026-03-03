import '../config/firebase';
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import SplashScreen from './components/Others/SplashScreen';

export default function Layout() {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Initialize auth
    const unsubscribe = useAuthStore.getState().initializeAuth();
    
    // Mark app as ready after a short delay (to allow auth to initialize)
    const timer = setTimeout(() => {
      setAppReady(true);
    }, 500);

    return () => {
      if (unsubscribe) unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  // Handle splash screen finish
  const handleSplashFinish = () => {
    // Only hide splash when app is ready
    if (appReady) {
      setShowSplash(false);
    } else {
      // If app not ready yet, wait a bit more
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  // Show splash screen while loading
  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show main app after splash
  return <Stack screenOptions={{ headerShown: false }} />;
}