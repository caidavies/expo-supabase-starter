import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useAuth } from "@/context/supabase-provider";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { Settings2, Bell, Users, CircleQuestionMark } from "lucide-react-native";
import { router } from "expo-router";

export default function HomeScreen() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView className="flex-1 px-5 py-40">
				<View className="flex-1 items-center justify-center">
					<Text>Home</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}