import React from "react";
import { Tabs } from "expo-router";
import Icon from "react-native-remix-icon";


export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={{
			tabBarStyle: {
				backgroundColor: "#121212",
				borderTopWidth: 1,
				borderTopColor: "#E5E5E5",
				paddingBottom: 16,
				paddingTop: 8,
				height: 72,
			},
			tabBarShowLabel: false,
			headerShown: false,
			tabBarActiveTintColor: "#FFFFFF",
			tabBarInactiveTintColor: "#8E8E93",
			tabBarIcon: ({ color, size, focused }) => (
				<Icon name={focused ? "home-fill" : "home-line"} size={size} color={color} />
			),
		}}
		>
			<Tabs.Screen name="index"/>
			<Tabs.Screen
				name="FavoritesScreen"
				options={{
					// title: "Favorites",
					headerTitle: "Favorites", // This sets the header title
					tabBarIcon: ({ color, size, focused }) => (
						<Icon name={focused ? "heart-fill" : "heart-line"} size={size} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="SettingsScreen"
				options={{
					// title: "Settings",
					headerTitle: "Settings", // This sets the header title
					tabBarIcon: ({ color, size, focused }) => (
						<Icon name={focused ? "user-fill" : "user-line"} size={size} color={color} />
					),
				}}
			/>
		</Tabs>
	);
}