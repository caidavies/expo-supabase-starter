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
import { useOnboarding } from "@/context/onboarding-provider";

const profileSchema = z.object({
	name: z.string().min(2, "Please enter your name."),
	email: z.string().email("Please enter a valid email address."),
});

export default function Profile() {
	const { updateProfile } = useOnboarding();
	
	const form = useForm<z.infer<typeof profileSchema>>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: "",
			email: "",
		},
	});

	async function onSubmit(data: z.infer<typeof profileSchema>) {
		try {
			// Store profile data in onboarding context
			updateProfile(data);
			form.reset();
			router.push("/onboarding/preferences");
		} catch (error: Error | any) {
			console.error(error.message);
		}
	}

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
						Let&apos;s start with the basics. We&apos;ll use this information to personalize your experience.
					</Muted>
				</View>

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

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={form.handleSubmit(onSubmit)}
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting ? (
						<ActivityIndicator size="small" />
					) : (
						<Text>Continue</Text>
					)}
				</Button>
				
				<Button
					size="default"
					variant="secondary"
					onPress={() => router.back()}
					disabled={form.formState.isSubmitting}
				>
					<Text>Back</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
} 