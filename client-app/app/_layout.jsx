import '../config/_firebase'
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import useAuthStore from '../store/_authStore';

export default function Layout() {
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().initializeAuth();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return <Stack screenOptions={{ headerShown: false }} />;
}
