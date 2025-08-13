import React, { useState } from "react";
import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";

const religionOptions = [
	"Christianity",
	"Islam",
	"Hinduism",
	"Buddhism",
	"Judaism",
	"Atheist",
	"Agnostic",
	"Other",
	"Prefer not to say",
];

export default function ReligionScreen() {
	const [selectedReligion, setSelectedReligion] = useState("");
	const { updateProfile } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();
	const handleNext = () => {
		if (selectedReligion) {
			// Store religion in profile context
			updateProfile({ religion: selectedReligion });
			console.log("Religion saved:", selectedReligion);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<H1 className="self-start">What&apos;s your religion?</H1>
					<Muted className="flex">
						This helps us find matches with similar values and beliefs.
					</Muted>
				</View>

				<View className="gap-3">
					{religionOptions.map((option) => (
						<Button
							key={option}
							variant={selectedReligion === option ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => setSelectedReligion(option)}
						>
							<Text className={selectedReligion === option ? "text-white" : ""}>
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
					disabled={!selectedReligion}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
