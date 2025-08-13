import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import Icon from "react-native-remix-icon";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";


const drinkingOptions = ["Yes", "Sometimes", "I don't drink"];

export default function DrinkingScreen() {
	const [selectedOption, setSelectedOption] = useState("");
	const { updateProfile } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();
	const handleNext = () => {
		if (selectedOption) {
			// Store drinking preference in profile context
			updateProfile({ drinking: selectedOption });
			console.log("Drinking preference saved:", selectedOption);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4">
			<View className="flex-1 gap-6 py-0 web:m-4">
				<View className="gap-4">
					<View className="gap-4 items-start">
						<Icon name="goblet-line" size={24} color="#212030" />
						<H1>Do you drink?</H1>
					</View>
				</View>

				<View className="gap-3">
					{drinkingOptions.map((option) => (
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
