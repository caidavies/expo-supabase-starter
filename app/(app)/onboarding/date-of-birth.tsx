import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function DateOfBirthScreen() {
	const [month, setMonth] = useState("");
	const [day, setDay] = useState("");
	const [year, setYear] = useState("");

	const validateInputs = () => {
		const monthNum = parseInt(month);
		const dayNum = parseInt(day);
		const yearNum = parseInt(year);
		
		// Basic validation
		if (!month || !day || !year) return false;
		if (monthNum < 1 || monthNum > 12) return false;
		if (dayNum < 1 || dayNum > 31) return false;
		if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
		
		return true;
	};

	const calculateAge = () => {
		if (!validateInputs()) return null;
		
		const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
		const today = new Date();
		let age = today.getFullYear() - birthDate.getFullYear();
		const monthDiff = today.getMonth() - birthDate.getMonth();
		
		if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
			age--;
		}
		
		return age;
	};

	const handleNext = () => {
		if (validateInputs()) {
			const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
			// TODO: Save date of birth to onboarding context or database
			console.log("Date of birth:", birthDate);
			console.log("Month:", month, "Day:", day, "Year:", year);
			router.push("/(app)/onboarding/complete");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				keyboardVerticalOffset={0}
			>
				<View className="flex-1 gap-6 py-24 web:m-4">
					<View className="gap-4">
						<View className="flex-row items-center gap-3 mb-4">
							<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
								<Text className="text-white font-bold">3</Text>
							</View>
							<Muted>Share your date of birth</Muted>
						</View>
						
						<H1 className="self-start">When&apos;s your birthday?</H1>
						<Muted className="flex">
							Your age will be calculated automatically and kept private.
						</Muted>
					</View>

					<View className="gap-6">
						<View className="gap-4">
							<Text className="text-sm font-medium">Date of Birth</Text>
							<View className="flex-row gap-3">
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground mb-1">Month</Text>
									<Input
										placeholder="MM"
										value={month}
										onChangeText={(text) => {
											// Only allow numbers and limit to 2 digits
											const cleaned = text.replace(/\D/g, '').slice(0, 2);
											setMonth(cleaned);
										}}
										keyboardType="numeric"
										maxLength={2}
									/>
								</View>
								<View className="flex-1">
									<Text className="text-xs text-muted-foreground mb-1">Day</Text>
									<Input
										placeholder="DD"
										value={day}
										onChangeText={(text) => {
											// Only allow numbers and limit to 2 digits
											const cleaned = text.replace(/\D/g, '').slice(0, 2);
											setDay(cleaned);
										}}
										keyboardType="numeric"
										maxLength={2}
									/>
								</View>
								<View className="flex-[1.5]">
									<Text className="text-xs text-muted-foreground mb-1">Year</Text>
									<Input
										placeholder="YYYY"
										value={year}
										onChangeText={(text) => {
											// Only allow numbers and limit to 4 digits
											const cleaned = text.replace(/\D/g, '').slice(0, 4);
											setYear(cleaned);
										}}
										keyboardType="numeric"
										maxLength={4}
									/>
								</View>
							</View>
						</View>

						{validateInputs() && (
							<View className="bg-muted/50 rounded-lg p-4 items-center">
								<Text className="text-lg font-semibold">
									{month}/{day}/{year}
								</Text>
								<Muted className="text-sm">
									Age: {calculateAge()} years old
								</Muted>
							</View>
						)}
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={handleNext}
						disabled={!validateInputs()}
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
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}