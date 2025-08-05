import React, { useState } from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function FirstNameScreen() {
	const [firstName, setFirstName] = useState("");

	const handleNext = () => {
		if (firstName.trim()) {
			// TODO: Save first name to onboarding context or database
			console.log("First name:", firstName);
			router.push("/(app)/onboarding/gender");
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
								<Text className="text-white font-bold">1</Text>
							</View>
							<Muted>Tell us your name</Muted>
						</View>
						
						<H1 className="self-start">What&apos;s your first name?</H1>
						<Muted className="flex">
							This is how you&apos;ll appear to others in the app.
						</Muted>
					</View>

					<View className="gap-4">
						<View className="gap-2">
							<Text className="text-sm font-medium">First Name</Text>
							<Input
								placeholder="Enter your first name"
								value={firstName}
								onChangeText={setFirstName}
								autoCapitalize="words"
								autoComplete="given-name"
								autoCorrect={false}
								autoFocus={true}
							/>
						</View>
					</View>
				</View>

				<View className="gap-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={handleNext}
						disabled={!firstName.trim()}
					>
						<Text>Next</Text>
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