import { View } from "react-native";

import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

export default function Settings() {
	const { signOut } = useAuth();

	return (
		<View className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<H1 className="text-center">Settings</H1>
			<Muted className="text-center text-lg">
				Manage your account and preferences here.
			</Muted>
			
			<View className="gap-4 w-full max-w-sm">
				<Button
					size="default"
					variant="destructive"
					onPress={signOut}
				>
					<Text>Sign Out</Text>
				</Button>
			</View>
		</View>
	);
}