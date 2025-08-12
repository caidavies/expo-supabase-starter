import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useAuth } from "@/context/supabase-provider";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

export default function SettingsScreen() {
	const { signOut } = useAuth();
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Settings",
		});
	}, [navigation]);

	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView className="flex-1 px-5">
				<Text>Settings</Text>
			</ScrollView>
		</SafeAreaView>
	);
}