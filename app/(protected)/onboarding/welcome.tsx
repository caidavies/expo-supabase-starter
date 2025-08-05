import React from "react";
import { View } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function OnboardingWelcome() {
	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-8 py-24 web:m-4">
				<View className="flex-1 justify-center items-center gap-6">
					<View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
						<Text className="text-4xl">👋</Text>
					</View>
					
					<View className="items-center gap-4">
						<H1 className="text-center">Welcome to Your App!</H1>
						<Muted className="text-center text-lg">
							We&apos;re excited to have you on board. Let&apos;s get you set up in just a few steps.
						</Muted>
					</View>
				</View>

				<View className="gap-4">
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">1</Text>
						</View>
						<Muted>Set up your profile</Muted>
					</View>
					
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-muted rounded-full items-center justify-center">
							<Text className="text-muted-foreground font-bold">2</Text>
						</View>
						<Muted>Choose your preferences</Muted>
					</View>
					
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-muted rounded-full items-center justify-center">
							<Text className="text-muted-foreground font-bold">3</Text>
						</View>
						<Muted>Start exploring</Muted>
					</View>
				</View>
			</View>

			<Button
				size="default"
				variant="default"
				onPress={() => router.push("/(protected)/onboarding/profile")}
				className="web:m-4"
			>
				<Text>Get Started</Text>
			</Button>
		</SafeAreaView>
	);
} 