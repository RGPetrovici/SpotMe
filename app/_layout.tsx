import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="registro" options={{ headerShown: true, title: 'Crear Cuenta' }} />
      <Stack.Screen name="setup" options={{ headerShown: false }} />
      <Stack.Screen name="setup2" options={{ headerShown: false }} />
      <Stack.Screen name="setup3" options={{ headerShown: false }} />
      <Stack.Screen name="setup4" options={{ headerShown: false }} />
      <Stack.Screen name="setup5" options={{ headerShown: false }} />
      <Stack.Screen name="feed" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="chats" options={{ headerShown: false }} />
      <Stack.Screen name="entrenos" options={{ headerShown: false }} />
      <Stack.Screen name="store" options={{ headerShown: false }} />
      <Stack.Screen name="likes" options={{ headerShown: false }} />
      <Stack.Screen name="buy-tokens" options={{ headerShown: false }} />
      <Stack.Screen name="review" options={{ headerShown: false }} />
      <Stack.Screen name="chat-room" options={{ headerShown: false }} />
    </Stack>
  );
}