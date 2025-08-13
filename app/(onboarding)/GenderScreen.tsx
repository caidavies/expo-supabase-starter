import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import Icon from "react-native-remix-icon";

const genderOptions = ["Male", "Female", "Non Binary"];

export default function GenderScreen() {
	const [selectedGender, setSelectedGender] = useState("");
	const { updateUser } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();

	const handleNext = () => {
		if (selectedGender) {
			// Store the gender in onboarding context (core user data)
			updateUser({ gender: selectedGender });
			console.log("Gender saved:", selectedGender);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="gap-4 items-start">
						<Icon name="genderless-line" size={24} color="#212030" />
						<H1>What&apos;s your gender?</H1>
						<Muted>
							Which gender do you identify with?
						</Muted>
					</View>
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
					size="lg"
					variant="default"
					onPress={handleNext}
					disabled={!selectedGender}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
