import { Stack, router } from "expo-router";
import { useEffect } from "react";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";
import { useAuth } from "@/context/supabase-provider";

export default function PublicLayout() {
	const { colorScheme } = useColorScheme();
	const { session } = useAuth();

	useEffect(() => {
		// If user has a session but is in public area, they might need onboarding
		if (session?.user) {
			console.log("User has session in public area - checking if they need onboarding");
			// We'll handle the onboarding redirect in the welcome screen
		}
	}, [session]);

	return (
		<Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
			<Stack.Screen name="welcome" />
			<Stack.Screen name="onboarding" />
			<Stack.Screen
				name="sign-up"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Sign Up",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
					gestureEnabled: true,
				}}
			/>
			<Stack.Screen
				name="sign-in"
				options={{
					presentation: "modal",
					headerShown: true,
					headerTitle: "Sign In",
					headerStyle: {
						backgroundColor:
							colorScheme === "dark"
								? colors.dark.background
								: colors.light.background,
					},
					headerTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
					gestureEnabled: true,
				}}
			/>
		</Stack>
	);
}
