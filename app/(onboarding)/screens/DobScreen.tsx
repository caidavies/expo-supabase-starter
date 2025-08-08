import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

export default function DobScreen() {
	const [day, setDay] = useState("");
	const [month, setMonth] = useState("");
	const [year, setYear] = useState("");
	const { updateProfile } = useOnboarding();

	const handleNext = () => {
		if (day.trim() && month.trim() && year.trim()) {
			// Store the date of birth in onboarding context
			updateProfile({
				dateOfBirth: { day, month, year },
			});
			console.log("Date of birth saved:", { day, month, year });
			router.push("/(onboarding)/screens/GenderScreen");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={16}
			>
				<View className="flex-1 gap-6 py-24 web:m-4">
					<View className="gap-4">
						<H1 className="self-start">What&apos;s your date of birth?</H1>
						<Muted className="flex">
							We use this to show your age and find people in your age range.
						</Muted>
					</View>

					<View className="gap-4">
						<View className="flex-row gap-3">
							<View className="flex-1 gap-2">
								<Label>Day</Label>
								<Input
									placeholder="DD"
									value={day}
									onChangeText={setDay}
									keyboardType="numeric"
									autoCorrect={false}
								/>
							</View>
							<View className="flex-1 gap-2">
								<Label>Month</Label>
								<Input
									placeholder="MM"
									value={month}
									onChangeText={setMonth}
									keyboardType="numeric"
									autoCorrect={false}
								/>
							</View>
							<View className="flex-1 gap-2">
								<Label>Year</Label>
								<Input
									placeholder="YYYY"
									value={year}
									onChangeText={setYear}
									keyboardType="numeric"
									autoCorrect={false}
								/>
							</View>
						</View>
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={handleNext}
						disabled={!day.trim() || !month.trim() || !year.trim()}
					>
						<Text>Next</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
