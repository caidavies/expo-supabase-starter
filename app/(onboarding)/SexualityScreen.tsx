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


const sexualityOptions = ["Men", "Women", "Non-Binary"];

export default function SexualityScreen() {
	const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
	const { updateDatingPreferences } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();

	const handleOptionToggle = (option: string) => {
		setSelectedOptions((prev) =>
			prev.includes(option)
				? prev.filter((item) => item !== option)
				: [...prev, option],
		);
	};

	const handleNext = () => {
		if (selectedOptions.length > 0) {
			// Store sexuality in dating preferences context
			updateDatingPreferences({ sexuality: selectedOptions.join(", ") });
			console.log("Sexuality saved:", selectedOptions);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="gap-4 items-start">
						<Icon name="heart-2-line" size={24} color="#212030" />
						<H1>Who are you attracted to?</H1>
						<Muted>
							Select all that apply to help us find better matches.
						</Muted>
					</View>
				</View>

				<View className="gap-3">
					{sexualityOptions.map((option) => (
						<Button
							key={option}
							variant={selectedOptions.includes(option) ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => handleOptionToggle(option)}
						>
							<Text
								className={selectedOptions.includes(option) ? "text-white" : ""}
							>
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
					disabled={selectedOptions.length === 0}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
