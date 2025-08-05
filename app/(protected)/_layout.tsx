import { Stack, router } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function ProtectedLayout() {
	const { session, checkUserPreferences } = useAuth();

	useEffect(() => {
		const checkUserState = async () => {
			console.log("=== PROTECTED LAYOUT - CHECKING USER STATE ===");
			console.log("Session:", session?.user?.id);
			console.log("Session exists:", !!session);

			if (session?.user) {
				console.log("Session detected, checking user state...");
				
				// Check if user exists in users table
				const { data: existingUser, error: userError } = await supabase
					.from("users")
					.select("*")
					.eq("auth_user_id", session.user.id)
					.single();

				console.log("User exists in database:", !!existingUser);
				console.log("User error:", userError);
				console.log("User data:", existingUser);

				if (existingUser) {
					console.log("=== CHECKING PREFERENCES ===");
					const hasPreferences = await checkUserPreferences();
					console.log("Has preferences result:", hasPreferences);

					if (!hasPreferences) {
						console.log("⚠️ NO PREFERENCES - REDIRECTING TO ONBOARDING");
						console.log("Attempting navigation to: /(protected)/onboarding/welcome");
						router.replace("/(protected)/onboarding/welcome");
						console.log("Navigation command sent");
					} else {
						console.log("✅ HAS PREFERENCES - STAYING IN PROTECTED AREA");
					}
				} else {
					console.log("❌ USER NOT IN DATABASE - REDIRECTING TO ONBOARDING");
					console.log("Attempting navigation to: /(protected)/onboarding/welcome");
					router.replace("/(protected)/onboarding/welcome");
					console.log("Navigation command sent");
				}
			} else {
				console.log("No session detected");
			}
		};

		// Add a small delay to ensure everything is loaded
		const timeoutId = setTimeout(() => {
			checkUserState();
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [session, checkUserPreferences]);

	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
			<Stack.Screen name="onboarding" />
		</Stack>
	);
}
