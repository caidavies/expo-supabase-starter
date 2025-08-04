import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";

const onboardingSchema = z.object({
	name: z.string().min(2, "Please enter your name."),
	email: z.string().email("Please enter a valid email address."),
});

export default function Onboarding() {
	const { completeOnboarding } = useAuth();

	const form = useForm<z.infer<typeof onboardingSchema>>({
		resolver: zodResolver(onboardingSchema),
		defaultValues: {
			name: "",
			email: "",
		},
	});

	async function onSubmit(data: z.infer<typeof onboardingSchema>) {
		try {
			await completeOnboarding(data.name, data.email);
			form.reset();
			// Navigate to the homepage after onboarding completion
			router.push("/(protected)/(tabs)");
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 py-24 web:m-4">
				<H1 className="self-start">Welcome!</H1>
				<Muted className="flex">
					Let&apos;s set up your profile to get started.
				</Muted>

				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormInput
									label="Full Name"
									placeholder="Enter your full name"
									autoCapitalize="words"
									autoComplete="name"
									autoCorrect={false}
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="Email"
									placeholder="Enter your email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>

			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={form.formState.isSubmitting}
				className="web:m-4"
			>
				{form.formState.isSubmitting ? (
					<ActivityIndicator size="small" />
				) : (
					<Text>Complete Setup</Text>
				)}
			</Button>
		</SafeAreaView>
	);
} 