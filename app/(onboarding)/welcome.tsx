import React from "react";
import { ImageBackground, View } from "react-native";
import { Stack } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";

export default function OnboardingWelcomeScreen() {
	const { next } = useOnboardingNavigation();

	return (
		<>
			<Stack.Screen 
				options={{
					title: "",
					headerStyle: {
						backgroundColor: "#212030", // Custom background color
					},
					headerTintColor: "#000000", // Custom text/icon color
					headerShadowVisible: false, // Remove shadow
				}}
			/>
			<SafeAreaView className="flex flex-1 bg-backgroundDark p-4">
				<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4 pb-40">
					<H1 className="text-center text-white">Splash screen</H1>
					<Muted className="text-center text-white/70 font-sans text-xl">
					Needs designing but this is the welcome screen
					</Muted>
				</View>
				<View className="flex flex-col gap-y-4 web:m-4">
					<Button
						size="lg"
						variant="white"
						onPress={next}
						className="w-full"
					>
						<Text>Get Started</Text>
					</Button>
				</View>
			</SafeAreaView>
		</>
	);
} 