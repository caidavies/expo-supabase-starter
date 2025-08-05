import { View } from "react-native";
import { router } from "expo-router";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function Modal() {
	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Modal Screen</H1>
			<Muted className="text-center text-lg">
				This is a modal screen within the authenticated area.
			</Muted>
			
			<Button
				size="default"
				variant="default"
				onPress={() => router.back()}
			>
				<Text>Close Modal</Text>
			</Button>
		</View>
	);
}