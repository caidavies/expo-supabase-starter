import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

export default function HeightScreen() {
	const [height, setHeight] = useState("");
	const { updateProfile } = useOnboarding();

	const handleNext = () => {
		if (height.trim()) {
			// Store height in profile context
			updateProfile({ height });
			console.log("Height saved:", height);
			router.push("/(onboarding)/screens/FamilyPlansScreen");
		}
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

					<View className="gap-4">
						<Input
							placeholder="Enter your height in cm"
							keyboardType="numeric"
							value={height}
							onChangeText={setHeight}
							className="text-center text-lg"
						/>
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={handleNext}
						disabled={!height.trim()}
					>
						<Text>Next</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
