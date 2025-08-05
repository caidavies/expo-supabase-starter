import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function ProfileScreen() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");

	const handleNext = () => {
		if (firstName.trim()) {
			// TODO: Save profile data
			console.log("Profile data:", { firstName, lastName });
			router.push("/(app)/onboarding/preferences");
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
						Let&apos;s start with your basic information.
					</Muted>
				</View>

				<View className="gap-4">
					<View className="gap-2">
						<Text className="text-sm font-medium">First Name *</Text>
						<Input
							placeholder="Enter your first name"
							value={firstName}
							onChangeText={setFirstName}
							autoCapitalize="words"
						/>
					</View>

					<View className="gap-2">
						<Text className="text-sm font-medium">Last Name</Text>
						<Input
							placeholder="Enter your last name"
							value={lastName}
							onChangeText={setLastName}
							autoCapitalize="words"
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
		</SafeAreaView>
	);
}