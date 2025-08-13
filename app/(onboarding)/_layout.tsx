import { Stack } from "expo-router";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function OnboardingLayout() {
	return (
		<OnboardingProvider>
			<Stack
				screenOptions={{
					title: "",
					headerShadowVisible: false,
					headerShown: true,
					headerBackButtonDisplayMode: "minimal",
					headerTintColor: "#000000",
					headerStyle: {
						backgroundColor: "#FFFFFF",
						borderBottom: "none",
						borderBottomColor: "transparent",
					},
					animation: "slide_from_right",
				}}
			>
				<Stack.Screen name="welcome" />
				<Stack.Screen name="preferences" />
				<Stack.Screen name="complete" />
				<Stack.Screen name="screens" />
			</Stack>
		</OnboardingProvider>
	);
} 