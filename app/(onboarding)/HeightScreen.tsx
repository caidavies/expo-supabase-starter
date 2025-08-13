import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import Icon from "react-native-remix-icon";

export default function HeightScreen() {
	const [selectedHeight, setSelectedHeight] = useState<number>(170);
	const { updateProfile } = useOnboarding();

	// Generate height options from 140cm to 220cm (common adult height range)
	const heightOptions = Array.from({ length: 81 }, (_, i) => 140 + i);

	const handleNext = () => {
		// Store height in profile context
		updateProfile({ height: selectedHeight.toString() });
		console.log("Height saved:", selectedHeight);
		router.push("/(onboarding)/FamilyPlansScreen");
	};

	const canContinue = selectedHeight !== null;

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={16}
			>
				<View className="flex-1 gap-6 py-24 web:m-4">
					<View className="gap-4">
						<View className="gap-4 items-start">
							<Icon name="ruler-line" size={24} color="#212030" />
							<H1>What&apos;s your height?</H1>
						</View>
					</View>

					<View className="gap-4 flex-1 justify-center">
						<View className="items-center">
							<Text className="text-2xl font-medium text-gray-800 mb-4">
								Your height
							</Text>
							<View className="h-48 w-full items-center justify-center">
								<Picker
									selectedValue={selectedHeight}
									onValueChange={(itemValue: number) =>
										setSelectedHeight(itemValue)
									}
									style={{
										width: Platform.OS === "ios" ? 200 : "100%",
										height: Platform.OS === "ios" ? 200 : 48,
									}}
									itemStyle={{
										fontSize: 20,
										textAlign: "center",
									}}
								>
									{heightOptions.map((height) => (
										<Picker.Item
											key={height}
											label={`${height} cm`}
											value={height}
										/>
									))}
								</Picker>
							</View>
						</View>
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						onPress={handleNext}
						disabled={!canContinue}
						size="lg"
						className={`w-full ${canContinue ? "bg-primary" : "bg-gray-300"}`}
					>
						<Text
							className={`text-center font-semibold ${canContinue ? "text-white" : "text-gray-600"}`}
						>
							Next
						</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
