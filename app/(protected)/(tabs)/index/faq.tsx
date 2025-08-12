import React from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";

export default function FAQPage() {
	return (
		<SafeAreaView className="flex-1 bg-white">
			<ScrollView className="flex-1 px-5">
				<View className="flex-1 items-center justify-center">
					<Text>FAQ Page</Text>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}