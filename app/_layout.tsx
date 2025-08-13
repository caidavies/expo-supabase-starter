import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { useFonts } from "@/app/hooks/useFonts";
import { View, Text } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
	const { session, loading } = useAuth();
	const { fontsLoaded, fontError } = useFonts();

	useEffect(() => {
		if (loading || !fontsLoaded) return;

		// Hide splash screen once fonts are loaded
		SplashScreen.hideAsync();
	}, [loading, fontsLoaded]);

	// Show loading screen while fonts are loading
	if (!fontsLoaded || fontError) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg">Loading fonts...</Text>
			</View>
		);
	}

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg">Loading...</Text>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{session ? (
				<Stack.Screen name="(protected)" />
			) : (
				<Stack.Screen name="(public)" />
			)}
		</Stack>
	);
}

export default function RootLayout() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<AuthProvider>
				<RootNavigator />
			</AuthProvider>
		</GestureHandlerRootView>
	);
}