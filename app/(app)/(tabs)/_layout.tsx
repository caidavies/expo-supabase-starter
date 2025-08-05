import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useColorScheme } from "@/lib/useColorScheme";
import { colors } from "@/constants/colors";

export default function TabLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: colors[colorScheme ?? "light"].tint,
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Settings",
					tabBarIcon: ({ color }) => <TabBarIcon name="cog" color={color} />,
				}}
			/>
		</Tabs>
	);
}

function TabBarIcon(props: {
	name: React.ComponentProps<typeof Ionicons>["name"];
	color: string;
}) {
	return <Ionicons size={28} style={{ marginBottom: -3 }} {...props} />;
}