import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { useAuth } from "@/context/supabase-provider";
import Icon from "react-native-remix-icon";

export default function DobScreen() {
	const [day, setDay] = useState("");
	const [month, setMonth] = useState("");
	const [year, setYear] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const { updateUser, data } = useOnboarding();
	const { next } = useOnboardingNavigation();
	const { createUserProfile } = useAuth();

	const handleNext = async () => {
		if (day.trim() && month.trim() && year.trim()) {
			try {
				setIsCreating(true);

				// Store the date of birth in onboarding context
				const dateOfBirth = { day, month, year };
				updateUser({ dateOfBirth });
				console.log("Date of birth saved:", dateOfBirth);

				// Get first name from onboarding context
				const firstName = data.user?.firstName;
				if (!firstName) {
					throw new Error(
						"First name not found - please go back and enter your first name",
					);
				}

				// Create user record in database now that we have required fields
				await createUserProfile(firstName, dateOfBirth);
				console.log("User profile created successfully");

				// Use the navigation system to go to next screen
				next();
			} catch (error) {
				console.error("Error creating user profile:", error);
				// Still allow navigation to continue onboarding
				next();
			} finally {
				setIsCreating(false);
			}
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
						<Icon name="calendar-line" size={24} color="#212030" />
						<H1 className="self-start">What&apos;s your date of birth?</H1>
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
						size="lg"
						variant="default"
						onPress={handleNext}
						disabled={
							!day.trim() || !month.trim() || !year.trim() || isCreating
						}
					>
						<Text>{isCreating ? "Creating Profile..." : "Next"}</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
