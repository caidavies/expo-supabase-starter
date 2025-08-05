import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

const preferenceOptions = [
	"Notifications",
	"Marketing Emails",
	"Analytics",
	"Dark Mode"
];

export default function PreferencesScreen() {
	const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

	const togglePreference = (preference: string) => {
		setSelectedPreferences(prev => 
			prev.includes(preference)
				? prev.filter(p => p !== preference)
				: [...prev, preference]
		);
	};

	const handleNext = () => {
		// TODO: Save preferences
		console.log("Selected preferences:", selectedPreferences);
		router.push("/(app)/onboarding/complete");
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">2</Text>
						</View>
						<Muted>Choose your preferences</Muted>
					</View>
					
					<H1 className="self-start">Customize your experience</H1>
					<Muted className="flex">
						Select the features you&apos;d like to enable.
					</Muted>
				</View>

				<View className="gap-3">
					{preferenceOptions.map((option) => (
						<Button
							key={option}
							variant={selectedPreferences.includes(option) ? "default" : "outline"}
							className="w-full justify-start"
							onPress={() => togglePreference(option)}
						>
							<Text className={selectedPreferences.includes(option) ? "text-white" : ""}>
								{selectedPreferences.includes(option) ? "✓ " : ""}{option}
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
				>
					<Text>Complete Setup</Text>
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