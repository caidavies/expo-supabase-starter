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

export default function FirstNameScreen() {
	const [firstName, setFirstName] = useState("");
	const { updateProfile } = useOnboarding();

	const handleNext = () => {
		if (firstName.trim()) {
			// Store the first name in onboarding context
			updateProfile({ firstName });
			console.log("First name saved:", firstName);
			router.push("/(onboarding)/screens/DobScreen");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={0}
			>
				<View className="flex-1 gap-6 py-24 web:m-4">
					<View className="gap-4">
						<H1 className="self-start">What&apos;s your first name?</H1>
						<Muted className="flex">
							This is how you&apos;ll appear to others.
						</Muted>
					</View>

					<View className="gap-4">
						<View className="gap-2">
							<Label>First Name</Label>
							<Input
								placeholder="Enter your first name"
								value={firstName}
								onChangeText={setFirstName}
								autoCapitalize="words"
								autoComplete="given-name"
								autoCorrect={false}
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
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}
