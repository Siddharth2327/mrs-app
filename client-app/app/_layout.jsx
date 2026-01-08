import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      {/* HOMEPAGE */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      
      {/* TRANSPORT PAGE */}
      <Stack.Screen 
        name="TransportPage"      // ← Changed to match TransportPage.jsx
        options={{ headerShown: false, animation: 'slide_from_bottom' }}
      />
      
      {/* CART PAGE */}
      <Stack.Screen 
        name="CartPage"           // ← Changed to match CartPage.jsx
        options={{ headerShown: false, animation: 'fade' }}
      />
      
      {/*  ENTERPRISES PAGE */}
      <Stack.Screen 
        name="EnterprisesPage"    // ← Changed to match EnterprisesPage.jsx
        options={{ headerShown: false }}
      />
      
      {/* ORDERS PAGE */}
      <Stack.Screen 
        name="OrdersPage"         // ← Changed to match OrdersPage.jsx
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
