import { Stack } from "expo-router";

export default function RootLayout() {
  return (
  <Stack>
    <Stack.Screen name="login" options={{headerShown: false}} />
    <Stack.Screen name="create-account" options={{headerShown: false}} />
    <Stack.Screen name="index" options={{headerShown: false, title: 'Recall Feed'}} />
    <Stack.Screen name="search" options={{title: 'Search Recalls'}} />
    <Stack.Screen name="watch-list" options={{title: 'Watch List'}} />
  </Stack>);
}
