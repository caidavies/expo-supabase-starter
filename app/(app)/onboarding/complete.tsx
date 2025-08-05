import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { router } from "expo-router";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function CompleteScreen() {
	const { session } = useAuth();
	const [isLoading, setIsLoading] = useState(false);

	const handleComplete = async () => {
		if (!session?.user) return;
		
		try {
			setIsLoading(true);
			
			// Mark user as onboarded in the database
			const { error } = await supabase
				.from("users")
				.update({ 
					is_onboarded: true,
					onboarding_completion: 100,
					updated_at: new Date().toISOString()
				})
				.eq("auth_user_id", session.user.id);

			if (error) {
				console.error("Error marking onboarding complete:", error);
			} else {
				console.log("Onboarding completed successfully!");
			}
			
			// Navigate to main app
			router.replace("/(app)/(tabs)");
		} catch (error) {
			console.error("Error completing onboarding:", error);
			setIsLoading(false);
		}
	};

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-8 py-24 web:m-4">
				<View className="flex-1 justify-center items-center gap-6">
					<View className="w-24 h-24 bg-green-500 rounded-full items-center justify-center">
						<Text className="text-4xl">🎉</Text>
					</View>
					
					<View className="items-center gap-4">
						<H1 className="text-center">You&apos;re all set!</H1>
						<Muted className="text-center text-lg">
							Your profile is complete and you&apos;re ready to start using the app.
						</Muted>
					</View>
				</View>

				<View className="gap-4">
					<View className="flex-row items-center gap-3">
						<View className="w-8 h-8 bg-primary rounded-full items-center justify-center">
							<Text className="text-white font-bold">3</Text>
						</View>
						<Muted>Start using the app</Muted>
					</View>
					
					<View className="bg-muted/50 rounded-lg p-4 gap-2">
						<Text className="font-medium">What&apos;s next?</Text>
						<Muted className="text-sm">
							• Explore the main features{'\n'}
							• Customize your settings{'\n'}
							• Start using the app
						</Muted>
					</View>
				</View>
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={handleComplete}
					disabled={isLoading}
				>
					{isLoading ? (
						<>
							<ActivityIndicator size="small" color="white" />
							<Text className="ml-2">Completing...</Text>
						</>
					) : (
						<Text>Start Using App</Text>
					)}
				</Button>
			</View>
		</SafeAreaView>
	);
}