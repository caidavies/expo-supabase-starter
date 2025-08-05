import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

const genderOptions = [
	"Male",
	"Female", 
	"Non-binary",
	"Prefer not to say"
];

export default function GenderScreen() {
	const [selectedGender, setSelectedGender] = useState("");

	const handleNext = () => {
		if (selectedGender) {
			// TODO: Save gender to onboarding context or database
			console.log("Gender:", selectedGender);
			router.push("/(app)/onboarding/date-of-birth");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="flex-row items-center gap-3 mb-4">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">2</Text>
						</View>
						<Muted>Select your gender</Muted>
					</View>
					
					<H1 className="self-start">What&apos;s your gender?</H1>
					<Muted className="flex">
						This helps us personalize your experience.
					</Muted>
				</View>

				<View className="gap-3">
					{genderOptions.map((option) => (
						<Button
							key={option}
							variant={selectedGender === option ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => setSelectedGender(option)}
						>
							<Text className={selectedGender === option ? "text-white" : ""}>
								{option}
							</Text>
						</Button>
					))}
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={handleNext}
					disabled={!selectedGender}
				>
					<Text>Next</Text>
				</Button>
				
				<Button
					size="default"
					variant="ghost"
					onPress={() => router.back()}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}