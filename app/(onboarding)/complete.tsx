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
			<View className="flex-1 gap-6 py-24 web:m-4">
				<View className="gap-4">
					<H1 className="self-start">Let's show off who you are, adding pictures, prompts & a bio</H1>
				</View>
			</View>
			<View className="gap-4 web:m-4">
					<Button
						size="default"
						variant="default"
						onPress={() => router.push("/screens/PhotoSelectionScreen")}
					>
						<Text>Next</Text>
					</Button>
				</View>
		</SafeAreaView>
	);
} 