import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

export default function HometownScreen() {
	const [hometown, setHometown] = useState("");
	const { updateProfile } = useOnboarding();

	const handleNext = () => {
		if (hometown.trim()) {
			// Store hometown in profile context
			updateProfile({ hometown });
			console.log("Hometown saved:", hometown);
			router.push("/(onboarding)/screens/WorkScreen");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<H1 className="self-start">Where are you from?</H1>
					<Muted className="flex">
						Tell us about your hometown or where you grew up.
					</Muted>
				</View>

				<View className="gap-4">
					<Input
						placeholder="Enter your hometown"
						value={hometown}
						onChangeText={setHometown}
						className="text-center text-lg"
					/>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={handleNext}
					disabled={!hometown.trim()}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
