import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Filter } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function ProtectedLayout() {
	const router = useRouter();

	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerLargeTitle: true,
				headerLargeTitleShadowVisible: false,
				headerBackButtonDisplayMode: "minimal",
				headerTitle: "Home",
				headerStyle: {
					backgroundColor: "#FFFFFF",
				},
			}}
		>
			<Stack.Screen name="(tabs)" />
			<Stack.Screen 
				name="(tabs)/index" 
				options={{
					title: "Home",
				}}
			/>
			<Stack.Screen 
				name="(tabs)/FavoritesScreen" 
				options={{
					title: "Favorites",
				}}
			/>
			<Stack.Screen 
				name="(tabs)/SettingsScreen" 
				options={{
					title: "Settings",
				}}
			/>
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