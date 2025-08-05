import "../global.css";

import { Stack } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import * as SplashScreen from "expo-splash-screen";

import { AuthProvider, useAuth } from "@/context/supabase-provider";
import { Text } from "@/components/ui/text";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
	duration: 400,
	fade: true,
});

export default function RootLayout() {
	return (
		<AuthProvider>
			<RootNavigator />
		</AuthProvider>
	);
}

function RootNavigator() {
	const { initialized, session } = useAuth();

	// Show loading screen while checking authentication state
	if (!initialized) {
		return (
			<View className="flex-1 bg-background items-center justify-center">
				<ActivityIndicator size="large" color="#007AFF" />
				<Text className="mt-4 text-muted-foreground">Loading...</Text>
			</View>
		);
	}

	SplashScreen.hideAsync();

	return (
		<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
			{/* Protected area - for authenticated users */}
			<Stack.Protected guard={!!session}>
				<Stack.Screen name="(app)" />
			</Stack.Protected>

			{/* Public area - for unauthenticated users */}
			<Stack.Protected guard={!session}>
				<Stack.Screen name="(auth)" />
			</Stack.Protected>
		</Stack>
	);
}
