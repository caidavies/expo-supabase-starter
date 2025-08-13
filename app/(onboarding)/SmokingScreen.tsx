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


const smokingOptions = ["Yes", "Sometimes", "No"];

export default function SmokingScreen() {
	const [selectedOption, setSelectedOption] = useState("");
	const { updateProfile } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();
	const handleNext = () => {
		if (selectedOption) {
			// Store smoking preference in onboarding context
			updateProfile({ smoking: selectedOption });
			console.log("Smoking preference saved:", selectedOption);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="gap-4 items-start">
						<Icon name="pencil-line" size={24} color="#212030" />
						<H1>Do you smoke?</H1>
					</View>
				</View>

				<View className="gap-3">
					{smokingOptions.map((option) => (
						<Button
							key={option}
							variant={selectedOption === option ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => setSelectedOption(option)}
						>
							<Text className={selectedOption === option ? "text-white" : ""}>
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
					disabled={!selectedOption}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
