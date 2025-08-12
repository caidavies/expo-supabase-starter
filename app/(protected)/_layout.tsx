import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Filter } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ProtectedLayout() {
	const router = useRouter();

	return (
		<Stack
			screenOptions={{
				headerShown: false, // Let tabs handle their own headers
			}}
		>
			<Stack.Screen name="(tabs)/index" />
			<Stack.Screen name="(tabs)/FavoritesScreen" />
			<Stack.Screen name="(tabs)/SettingsScreen" />
			<Stack.Screen 
				name="modal" 
				options={{ 
					presentation: "modal",
					title: "Modal",
				}} 
			/>
		</Stack>
	);
}