import { Stack } from "expo-router";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function OnboardingLayout() {
	return (
		<OnboardingProvider>
			<Stack
				screenOptions={{
					headerShown: false,
					animation: "slide_from_right",
				}}
			>
				<Stack.Screen name="welcome" />
				<Stack.Screen name="profile" />
				<Stack.Screen name="preferences" />
				<Stack.Screen name="complete" />
				<Stack.Screen name="screens" />
			</Stack>
		</OnboardingProvider>
	);
} 