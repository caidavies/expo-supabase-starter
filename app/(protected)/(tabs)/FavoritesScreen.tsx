import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { Filter } from "lucide-react-native";

export default function FavoritesScreen() {
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Favorites",
			headerRight: () => (
				<TouchableOpacity 
					onPress={() => router.push("/modal")}
					className="mr-4"
				>
					<Filter size={24} color="#007AFF" />
				</TouchableOpacity>
			),
		});
	}, [navigation]);

	return (
		<SafeAreaView className="flex-1 bg-white px-5">
			<Text>Favorites</Text>
		</SafeAreaView>
	);
}