import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";

export default function FavoritesScreen() {
	const navigation = useNavigation();

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Favorites",
		});
	}, [navigation]);

	return (
		<SafeAreaView className="flex-1 bg-white px-5">
			<Text>Favorites</Text>
		</SafeAreaView>
	);
}