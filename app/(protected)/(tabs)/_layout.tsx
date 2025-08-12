import React from "react";
import { Tabs } from "expo-router";
import { Home, Heart, Settings } from "lucide-react-native";

export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false, // Hide tab headers since parent handles them
				tabBarActiveTintColor: "#000000",
				tabBarInactiveTintColor: "#8E8E93",
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopWidth: 1,
					borderTopColor: "#E5E5E5",
					paddingBottom: 5,
					paddingTop: 5,
					height: 100,
				},
				tabBarLabelStyle: {
					fontSize: 12,
					fontWeight: "600",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size, focused }) => (
						<Home size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="FavoritesScreen"
				options={{
					title: "Favorites",
					tabBarIcon: ({ color, size, focused }) => (
						<Heart size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="SettingsScreen"
				options={{
					title: "Settings",
					tabBarIcon: ({ color, size, focused }) => (
						<Settings size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}