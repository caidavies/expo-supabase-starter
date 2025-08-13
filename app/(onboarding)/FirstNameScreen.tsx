import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, View } from "react-native";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { BorderlessInput } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import Icon from "react-native-remix-icon";

export default function FirstNameScreen() {
	const [firstName, setFirstName] = useState("");
	const { updateUser } = useOnboarding();
	const { next, canGoNext } = useOnboardingNavigation();

	const handleNext = () => {
		if (firstName.trim()) {
			// Store the first name in onboarding context
			updateUser({ firstName });
			console.log("First name saved:", firstName);
			// Use the navigation system to go to next screen
			next();
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<KeyboardAvoidingView
				style={{ flex: 1 }}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={120}
			>
				<View className="flex-1 gap-0 py-24 web:m-4">
					<View className="gap-4 items-start">
						<Icon name="profile-line" size={24} color="#212030" />
						<H1 className="self-start font-serif font-bold w-full">
							What&apos;s your name?
						</H1>
					</View>

					<View className="gap-4">
						<View className="gap-2">
							<BorderlessInput
								placeholder="First name"
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
						size="lg"
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
