import React from "react";
import { Tabs } from "expo-router";
import { Home, Heart, Settings } from "lucide-react-native";

export default function TabsLayout() {
	return (
		<Tabs>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerShown: false,
					tabBarIcon: ({ color, size, focused }) => (
						<Home size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="FavoritesScreen"
				options={{
					title: "Favorites",
					headerTitle: "Favorites", // This sets the header title
					tabBarIcon: ({ color, size, focused }) => (
						<Heart size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="SettingsScreen"
				options={{
					title: "Settings",
					headerTitle: "Settings", // This sets the header title
					tabBarIcon: ({ color, size, focused }) => (
						<Settings size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}