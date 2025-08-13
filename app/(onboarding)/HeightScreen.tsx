import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

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

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={16}
			>
				<View className="flex-1 gap-6 py-24 web:m-4">
					<View className="gap-4">
						<H1 className="self-start">What&apos;s your height?</H1>
						<Muted className="flex">
							This helps us find better matches for you.
						</Muted>
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

				<View className="items-center gap-4 web:m-4">
					<Button
						size="lg"
						variant="default"
						onPress={handleNext}
						className="w-full"
					>
						<Text>Next</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
