import React, { useEffect } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function WelcomeScreen() {
	const router = useRouter();
	const { colorScheme } = useColorScheme();
	const { session, checkUserPreferences } = useAuth();
	
	const appIcon =
		colorScheme === "dark"
			? require("@/assets/icon.png")
			: require("@/assets/icon-dark.png");

	useEffect(() => {
		const checkUserState = async () => {
			if (session?.user) {
				console.log("User has session in welcome screen - checking onboarding status");
				
				// Check if user exists in database
				const { data: existingUser } = await supabase
					.from("users")
					.select("*")
					.eq("auth_user_id", session.user.id)
					.single();

				if (existingUser) {
					// Check if user has preferences
					const hasPreferences = await checkUserPreferences();
					console.log("Has preferences:", hasPreferences);

					if (!hasPreferences) {
						console.log("User needs onboarding - redirecting");
						router.replace("/onboarding/welcome");
					} else {
						console.log("User has preferences - redirecting to protected area");
						router.replace("/(protected)/(tabs)");
					}
				} else {
					console.log("User not in database - redirecting to onboarding");
					router.replace("/onboarding/welcome");
				}
			}
		};

		checkUserState();
	}, [session, checkUserPreferences, router]);

	return (
		<SafeAreaView className="flex flex-1 bg-background p-4">
			<View className="flex flex-1 items-center justify-center gap-y-4 web:m-4">
				<Image source={appIcon} className="w-16 h-16 rounded-xl" />
				<H1 className="text-center">Welcome to Expo Supabase Starter</H1>
				<Muted className="text-center">
					A comprehensive starter project for developing React Native and Expo
					applications with Supabase as the backend.
				</Muted>
			</View>
			<View className="flex flex-col gap-y-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={() => {
						router.push("/phone-verify");
					}}
				>
					<Text>Continue with Phone</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
