import { Stack } from "expo-router";

export default function AppLayout() {
	// TODO: Add onboarding check logic here
	// This is where we'll check if user has completed onboarding
	// and redirect to onboarding flow if needed
	
	return (
		<Stack screenOptions={{ headerShown: false }}>
			{/* Main app with tabs for completed users */}
			<Stack.Screen name="(tabs)" />
			
			{/* Onboarding flow for new users */}
			<Stack.Screen name="onboarding" />
			
			{/* Modal screens */}
			<Stack.Screen name="modal" options={{ presentation: "modal" }} />
		</Stack>
	);
}