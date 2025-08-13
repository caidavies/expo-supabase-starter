import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/context/supabase-provider";
import { useFonts } from "@/app/hooks/useFonts";
import { supabase } from "@/config/supabase";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function RootNavigator() {
	const { session, initialized } = useAuth();
	const { fontsLoaded, fontError } = useFonts();

	useEffect(() => {
		if (!initialized || !fontsLoaded) return;

		// Hide splash screen once loading is complete
		SplashScreen.hideAsync();
	}, [initialized, fontsLoaded]);

	if (!initialized || !fontsLoaded) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg">Loading...</Text>
			</View>
		);
	}

	if (fontError) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<Text className="text-lg text-red-500">Error loading fonts</Text>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Protected routes for authenticated users who completed onboarding */}
			{session && <Stack.Screen name="(protected)" />}

			{/* Public routes for unauthenticated users */}
			{!session && <Stack.Screen name="(public)" />}

			{/* Onboarding routes */}
			<Stack.Screen name="(onboarding)" />
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