import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";

export default function Profile() {
	const { updateProfile } = useOnboarding();
	const [name, setName] = useState("");

	const handleContinue = () => {
		if (name.trim().length >= 2) {
			// Store profile data in onboarding context
			updateProfile({ name });
			console.log("Profile name saved:", name);
			router.push("/(onboarding)/screens/DobScreen");
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">1</Text>
						</View>
						<Muted>Set up your profile</Muted>
					</View>

					<H1 className="self-start">Tell us about yourself</H1>
					<Muted className="flex">
						Let&apos;s start with the basics. We&apos;ll use this information to
						personalize your experience.
					</Muted>
				</View>

				<View className="gap-4">
					<View className="gap-2">
						<Label>Full Name</Label>
						<Input
							placeholder="Enter your full name"
							value={name}
							onChangeText={setName}
							autoCapitalize="words"
							autoComplete="name"
							autoCorrect={false}
						/>
					</View>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={handleContinue}
					disabled={name.trim().length < 2}
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
