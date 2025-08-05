import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

const preferenceOptions = [
	{ id: "notifications", label: "Push Notifications", description: "Get notified about important updates" },
	{ id: "marketing", label: "Marketing Emails", description: "Receive updates about new features" },
	{ id: "analytics", label: "Analytics", description: "Help us improve by sharing usage data" },
];

export default function Preferences() {
	const { updatePreferences } = useOnboarding();
	const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

	const togglePreference = (id: string) => {
		setSelectedPreferences(prev => 
			prev.includes(id) 
				? prev.filter(p => p !== id)
				: [...prev, id]
		);
	};

	const handleContinue = () => {
		// Store preferences in onboarding context
		updatePreferences(selectedPreferences);
		router.push("/onboarding/complete");
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
						Choose what you&apos;d like to receive. You can change these settings anytime.
					</Muted>
				</View>

				<View className="gap-4">
					{preferenceOptions.map((option) => (
						<View
							key={option.id}
							className={`p-4 rounded-lg border-2 ${
								selectedPreferences.includes(option.id)
									? "border-primary bg-primary/5"
									: "border-border bg-background"
							}`}
						>
							<Button
								variant="ghost"
								className="w-full h-auto p-0 justify-start"
								onPress={() => togglePreference(option.id)}
							>
								<View className="flex-row items-center gap-3 w-full">
									<View
										className={`w-5 h-5 rounded border-2 items-center justify-center ${
											selectedPreferences.includes(option.id)
												? "border-primary bg-primary"
												: "border-border"
										}`}
									>
										{selectedPreferences.includes(option.id) && (
											<Text className="text-white text-xs">✓</Text>
										)}
									</View>
									<View className="flex-1">
										<Text className="font-medium">{option.label}</Text>
										<Muted className="text-sm">{option.description}</Muted>
									</View>
								</View>
							</Button>
						</View>
					))}
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={handleContinue}
				>
					<Text>Continue</Text>
				</Button>
				
				<Button
					size="default"
					variant="secondary"
					onPress={() => router.back()}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
} 