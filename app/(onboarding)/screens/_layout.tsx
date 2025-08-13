import { Stack } from "expo-router";

export default function ScreensLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
				animation: "slide_from_right",
			}}
		>
			<Stack.Screen name="FirstNameScreen" />
			<Stack.Screen name="DobScreen" />
			<Stack.Screen name="NotificationsScreen" />
			<Stack.Screen name="LocationScreen" />
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
		</Stack>
	);
} 