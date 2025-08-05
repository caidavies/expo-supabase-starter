import { router } from "expo-router";
import { View } from "react-native";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function Home() {
	const { session, checkUserPreferences } = useAuth();

	useEffect(() => {
		const logUserDetails = async () => {
			console.log("=== HOME SCREEN DEBUG ===");
			console.log("Session:", session);
			console.log("Session user:", session?.user);
			console.log("Session user ID:", session?.user?.id);
			console.log("Session access token:", session?.access_token ? "Present" : "Missing");
			console.log("Session refresh token:", session?.refresh_token ? "Present" : "Missing");

			if (session?.user) {
				console.log("=== USER DATABASE CHECK ===");
				
				// Check if user exists in users table
				const { data: existingUser, error: userError } = await supabase
					.from("users")
					.select("*")
					.eq("auth_user_id", session.user.id)
					.single();

				console.log("Querying users table with auth_user_id:", session.user.id);
				console.log("Existing user data:", existingUser);
				console.log("User error:", userError);

				if (existingUser) {
					console.log("=== USER DETAILS ===");
					console.log("User ID:", existingUser.id);
					console.log("Auth User ID:", existingUser.auth_user_id);
					console.log("Email:", existingUser.email);
					console.log("First Name:", existingUser.first_name);
					console.log("Last Name:", existingUser.last_name);
					console.log("Created At:", existingUser.created_at);
					console.log("Updated At:", existingUser.updated_at);
					console.log("Is Active:", existingUser.is_active);
					console.log("Profile Completion:", existingUser.profile_completion_percentage);

					console.log("=== PREFERENCES CHECK ===");
					const hasPreferences = await checkUserPreferences();
					console.log("Has preferences:", hasPreferences);

					if (!hasPreferences) {
						console.log("⚠️ USER HAS NO PREFERENCES - SHOULD REDIRECT TO ONBOARDING");
					} else {
						console.log("✅ USER HAS PREFERENCES - CAN STAY ON HOME");
					}
				} else {
					console.log("❌ USER NOT FOUND IN DATABASE");
				}
			} else {
				console.log("❌ NO SESSION FOUND");
			}
		};

		logUserDetails();
	}, [session, checkUserPreferences]);

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Home</H1>
			<Muted className="text-center text-2xl">
				You are now authenticated and this session will persist even after
				closing the app.
			</Muted>
			<Button
				className="w-full"
				variant="default"
				size="default"
				onPress={() => router.push("/(protected)/modal")}
			>
				<Text>Open Modal</Text>
			</Button>
			
			{/* Test navigation button */}
			<Button
				className="w-full"
				variant="outline"
				size="default"
				onPress={() => {
					console.log("Manual navigation test to onboarding");
					router.push("/(protected)/onboarding/welcome");
				}}
			>
				<Text>Test Navigation to Onboarding</Text>
			</Button>
			
			{/* Test navigation to public welcome */}
			<Button
				className="w-full"
				variant="outline"
				size="default"
				onPress={() => {
					console.log("Manual navigation test to public welcome");
					router.push("/(public)/welcome");
				}}
			>
				<Text>Test Navigation to Public Welcome</Text>
			</Button>
			
			{/* Test navigation to modal */}
			<Button
				className="w-full"
				variant="outline"
				size="default"
				onPress={() => {
					console.log("Manual navigation test to modal");
					router.push("/(protected)/modal");
				}}
			>
				<Text>Test Navigation to Modal</Text>
			</Button>
		</View>
	);
}
