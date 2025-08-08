import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { useOnboarding } from "@/context/onboarding-provider";

export default function Complete() {
	const { completeOnboarding } = useAuth();
	const { data, clearData } = useOnboarding();
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		handleCompleteOnboarding();
	}, []);

	const handleCompleteOnboarding = async () => {
		try {
			setIsLoading(true);
			
			// Log all collected onboarding data
			console.log("=== COMPLETE ONBOARDING DATA ===");
			console.log("Full onboarding data:", JSON.stringify(data, null, 2));
			
			// Save all onboarding data to database
			await completeOnboarding(data);
			
			console.log("=== END ONBOARDING DATA ===");
			
			// Clear onboarding data
			clearData();
			
			// Simulate delay for demo purposes
			await new Promise(resolve => setTimeout(resolve, 2000));
			
			// Trigger re-evaluation of user state at root level
			router.replace("/");
		} catch (error: Error | any) {
			console.error("Error completing onboarding:", error);
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-8 py-24 web:m-4">
				<View className="flex-1 justify-center items-center gap-6">
					<View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
						<Text className="text-4xl">🎉</Text>
					</View>
					
					<View className="items-center gap-4">
						<H1 className="text-center">You&apos;re all set!</H1>
						<Muted className="text-center text-lg">
							Your profile has been created and your preferences have been saved. Welcome to the app!
						</Muted>
					</View>
				</View>

				<View className="gap-4">
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">3</Text>
						</View>
						<Muted>Start exploring</Muted>
					</View>
					
					<View className="bg-muted/50 rounded-lg p-4 gap-2">
						<Text className="font-medium">What&apos;s next?</Text>
						<Muted className="text-sm">
							• Explore the main features of the app{'\n'}
							• Customize your settings{'\n'}
							• Invite friends to join
						</Muted>
					</View>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				{isLoading ? (
					<View className="items-center gap-2">
						<ActivityIndicator size="large" />
						<Muted>Setting up your account...</Muted>
					</View>
				) : (
					<Button
						size="default"
						variant="default"
						onPress={handleCompleteOnboarding}
					>
						<Text>Get Started</Text>
					</Button>
				)}
				
				<Button
					size="default"
					variant="secondary"
					onPress={() => router.back()}
					disabled={isLoading}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
} 