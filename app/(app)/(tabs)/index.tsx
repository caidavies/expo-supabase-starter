import { router } from "expo-router";
import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function Home() {
	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Home</H1>
			<Muted className="text-center text-lg">
				Welcome to your authenticated home screen! This is where your main app content goes.
			</Muted>
			
			<View className="gap-4 w-full max-w-sm">
				<Button
					size="default"
					variant="outline"
					onPress={() => router.push("/(app)/onboarding")}
				>
					<Text>Go to Onboarding</Text>
				</Button>
				
				<Button
					size="default"
					variant="outline"
					onPress={() => router.push("/(app)/modal")}
				>
					<Text>Open Modal</Text>
				</Button>
			</View>
		</View>
	);
}