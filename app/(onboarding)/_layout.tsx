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
						backgroundColor: "#fbf8f1",
					},
					animation: "slide_from_right",
					gestureEnabled: true,
				}}
			>
				<Stack.Screen name="welcome" />
				<Stack.Screen name="FirstNameScreen" />
				<Stack.Screen name="DobScreen" />
				<Stack.Screen name="NotificationsScreen" />
				<Stack.Screen name="LocationScreen" />
				<Stack.Screen name="DatingAreasScreen" />
				<Stack.Screen name="PronounsScreen" />
				<Stack.Screen name="GenderScreen" />
				<Stack.Screen name="SexualityScreen" />
				<Stack.Screen name="RelationshipTypeScreen" />
				<Stack.Screen name="DatingIntentionScreen" />
				<Stack.Screen name="HeightScreen" />
				<Stack.Screen name="FamilyPlansScreen" />
				<Stack.Screen name="HometownScreen" />
				<Stack.Screen name="WorkScreen" />
				<Stack.Screen name="ReligionScreen" />
				<Stack.Screen name="DrinkingScreen" />
				<Stack.Screen name="SmokingScreen" />
				<Stack.Screen name="InterestsScreen" />
				<Stack.Screen name="PhotoSelectionScreen" />
				<Stack.Screen name="PromptsScreen" />
				<Stack.Screen name="complete" />
			</Stack>
		</OnboardingProvider>
	);
} 