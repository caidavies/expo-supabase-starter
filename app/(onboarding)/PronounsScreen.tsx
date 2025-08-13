import React, { useState } from "react";
import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import Icon from "react-native-remix-icon";

const pronounsOptions = [
	"He/Him",
	"She/Her",
	"They/Them",
	"He/They",
	"She/They",
	"Prefer not to say",
];

export default function PronounsScreen() {
	const [selectedPronouns, setSelectedPronouns] = useState("");
	const { next } = useOnboardingNavigation();

	const handleNext = () => {
		if (selectedPronouns) {
			console.log("Pronouns:", selectedPronouns);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="gap-4 items-start">
						<Icon name="chat-3-line" size={24} color="#212030" />
						<H1>What are your pronouns?</H1>
						<Muted>
							Which pronouns do you prefer to be called by?
						</Muted>
					</View>
				</View>

				<View className="gap-3">
					{pronounsOptions.map((option) => (
						<Button
							key={option}
							variant={selectedPronouns === option ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => setSelectedPronouns(option)}
						>
							<Text
								className={
									selectedPronouns === option
										? "text-white"
										: "text-steel-gray-950"
								}
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
					disabled={!selectedPronouns}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
} 