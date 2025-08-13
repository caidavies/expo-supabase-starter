import React, { useState, useMemo, useRef } from "react";
import { KeyboardAvoidingView, Platform, View, TextInput } from "react-native";

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

	// Refs for auto-focusing inputs
	const monthInputRef = useRef<TextInput>(null);
	const yearInputRef = useRef<TextInput>(null);

	// Handle day input with auto-focus to month
	const handleDayChange = (text: string) => {
		setDay(text);
		// Auto-focus to month when 2 digits are entered
		if (text.length === 2) {
			monthInputRef.current?.focus();
		}
	};

	// Handle month input with auto-focus to year
	const handleMonthChange = (text: string) => {
		setMonth(text);
		// Auto-focus to year when 2 digits are entered
		if (text.length === 2) {
			yearInputRef.current?.focus();
		}
	};

	// Calculate age and validation
	const ageValidation = useMemo(() => {
		if (!day.trim() || !month.trim() || !year.trim()) {
			return { isValid: false, age: null, error: null };
		}

		const dayNum = parseInt(day, 10);
		const monthNum = parseInt(month, 10);
		const yearNum = parseInt(year, 10);

		// Basic date validation
		if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) {
			return { isValid: false, age: null, error: null };
		}

		// Check if date is valid
		const inputDate = new Date(yearNum, monthNum - 1, dayNum);
		const today = new Date();

		// Check if the date is valid (not invalid date like Feb 30)
		if (
			inputDate.getFullYear() !== yearNum ||
			inputDate.getMonth() !== monthNum - 1 ||
			inputDate.getDate() !== dayNum
		) {
			return { isValid: false, age: null, error: null };
		}

		// Check if date is in the future
		if (inputDate > today) {
			return {
				isValid: false,
				age: null,
				error: null,
			};
		}

		// Calculate age
		let age = today.getFullYear() - inputDate.getFullYear();
		const monthDiff = today.getMonth() - inputDate.getMonth();

		if (
			monthDiff < 0 ||
			(monthDiff === 0 && today.getDate() < inputDate.getDate())
		) {
			age--;
		}

		// Check if user is 18 or over
		if (age < 18) {
			return {
				isValid: false,
				age,
				error: `You must be at least 18 years old. You are ${age} years old.`,
			};
		}

		// Check if user is not unreasonably old (over 100)
		if (age > 100) {
			return {
				isValid: false,
				age: null,
				error: null,
			};
		}

		return { isValid: true, age, error: null };
	}, [day, month, year]);

	const handleNext = async () => {
		if (ageValidation.isValid) {
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
				keyboardVerticalOffset={120}
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
									onChangeText={handleDayChange}
									keyboardType="numeric"
									autoCorrect={false}
									maxLength={2}
								/>
							</View>
							<View className="flex-1 gap-2">
								<Label>Month</Label>
								<Input
									ref={monthInputRef}
									placeholder="MM"
									value={month}
									onChangeText={handleMonthChange}
									keyboardType="numeric"
									autoCorrect={false}
									maxLength={2}
								/>
							</View>
							<View className="flex-1 gap-2">
								<Label>Year</Label>
								<Input
									ref={yearInputRef}
									placeholder="YYYY"
									value={year}
									onChangeText={setYear}
									keyboardType="numeric"
									autoCorrect={false}
									maxLength={4}
								/>
							</View>
						</View>

						{/* Error message display - only show for under 18 */}
						{ageValidation.error &&
							ageValidation.age !== null &&
							ageValidation.age < 18 && (
								<View className="bg-red-50 border border-red-200 rounded-lg p-3">
									<Text className="text-red-600 text-sm">
										{ageValidation.error}
									</Text>
								</View>
							)}
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						size="lg"
						variant="default"
						onPress={handleNext}
						disabled={!ageValidation.isValid || isCreating}
					>
						<Text>{isCreating ? "Creating Profile..." : "Next"}</Text>
					</Button>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
