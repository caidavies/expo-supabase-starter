import React, { useState } from "react";
import { View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { BorderlessInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";

export default function WorkScreen() {
	const [workInfo, setWorkInfo] = useState("");
	const { updateProfile } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();
	const handleNext = () => {
		if (workInfo.trim()) {
			// Store work info in profile context
			updateProfile({ work: workInfo });
			console.log("Work info saved:", workInfo);
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<H1 className="self-start">What do you do for work?</H1>
					<Muted className="flex">Tell us about your job or profession.</Muted>
				</View>

				<View className="gap-4">
					<BorderlessInput
						placeholder="Enter your job title"
						value={workInfo}
						onChangeText={setWorkInfo}
					/>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="lg"
					variant="default"
					onPress={handleNext}
					disabled={!workInfo.trim()}
				>
					<Text>Next</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
