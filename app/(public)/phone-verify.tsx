import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, TextInput } from "react-native";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

const phoneSchema = z.object({
	phone: z.string().min(10, "Please enter a valid phone number."),
});

const otpSchema = z.object({
	otp: z
		.string()
		.min(1, "Please enter the verification code.")
		.max(6, "Code must be 6 digits."),
});

export default function PhoneVerify() {
	const { verifyPhone, verifyOTP, session, checkUserPreferences } = useAuth();
	const [isOTPSent, setIsOTPSent] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [phoneNumber, setPhoneNumber] = useState('');
	const [hasNavigated, setHasNavigated] = useState(false);

	// Handle navigation after OTP verification
	useEffect(() => {
		const handleNavigation = async () => {
			if (hasNavigated) {
				console.log("Navigation already attempted, skipping");
				return;
			}

			console.log("=== PHONE VERIFICATION - NAVIGATION DEBUG ===");
			console.log("Session:", session);
			console.log("Session user:", session?.user);
			console.log("Session user ID:", session?.user?.id);
			
			if (session) {
				console.log("Session detected - redirecting to protected area");
				console.log("Onboarding check will be handled by protected layout");
				setHasNavigated(true);
				router.replace("/(protected)/(tabs)");
				console.log("Navigation command sent");
			} else {
				console.log("No session detected");
			}
		};

		// Add a small delay to ensure session is fully set
		const timeoutId = setTimeout(() => {
			handleNavigation();
		}, 100);

		return () => clearTimeout(timeoutId);
	}, [session, hasNavigated]);

	const phoneForm = useForm<z.infer<typeof phoneSchema>>({
		resolver: zodResolver(phoneSchema),
		defaultValues: {
			phone: "",
		},
	});

	const otpForm = useForm<z.infer<typeof otpSchema>>({
		resolver: zodResolver(otpSchema),
		defaultValues: {
			otp: "",
		},
	});

	async function onPhoneSubmit(data: z.infer<typeof phoneSchema>) {
		try {
			setIsLoading(true);
			await verifyPhone(data.phone);
			setPhoneNumber(data.phone);
			setIsOTPSent(true);
			phoneForm.reset();
		} catch (error: Error | any) {
			console.error(error.message);
		} finally {
			setIsLoading(false);
		}
	}

	async function onOTPSubmit(data: z.infer<typeof otpSchema>) {
		try {
			setIsLoading(true);
			await verifyOTP(data.otp, phoneNumber);
			otpForm.reset();
			// Navigation will be handled by auth state changes
		} catch (error: Error | any) {
			console.error(error.message);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<View className="flex-1 gap-4 web:m-4 py-52">
				<H1 className="self-start">Phone Verification</H1>
				<Muted className="text-center">
					{isOTPSent
						? "Enter the 6-digit code sent to your phone"
						: "Enter your phone number to continue"}
				</Muted>
				{!isOTPSent && (
					<Muted className="text-center text-xs">
						💡 For testing, use +15005550006 (code: 123456)
					</Muted>
				)}

				{/* Test navigation button */}
				<Button
					onPress={() => {
						console.log("Manual navigation test");
						router.replace("/onboarding/welcome");
					}}
					variant="outline"
				>
					<Text>Test Navigation to Onboarding</Text>
				</Button>

				{!isOTPSent ? (
					<Form {...phoneForm}>
						<View className="gap-4">
							<FormField
								control={phoneForm.control}
								name="phone"
								render={({ field }) => (
									<FormInput
										label="Phone Number"
										placeholder="+1234567890"
										autoCapitalize="none"
										autoComplete="tel"
										autoCorrect={false}
										keyboardType="phone-pad"
										{...field}
									/>
								)}
							/>
						</View>
					</Form>
				) : (
					<View className="gap-4">
						<TextInput
							className="h-12 rounded-md border border-input bg-background px-3 text-lg text-foreground placeholder:text-muted-foreground"
							placeholder="123456"
							autoCapitalize="none"
							autoCorrect={false}
							keyboardType="numeric"
							maxLength={6}
							value={otpForm.watch("otp")}
							onChangeText={(text) => otpForm.setValue("otp", text)}
						/>
					</View>
				)}
			</View>

			<View className="gap-4 web:m-4">
				<Button
					size="default"
					variant="default"
					onPress={
						isOTPSent
							? otpForm.handleSubmit(onOTPSubmit)
							: phoneForm.handleSubmit(onPhoneSubmit)
					}
					disabled={isLoading}
				>
					{isLoading ? (
						<ActivityIndicator size="small" />
					) : (
						<Text>{isOTPSent ? "Verify Code" : "Send Code"}</Text>
					)}
				</Button>

				{isOTPSent && (
					<Button
						size="default"
						variant="secondary"
						onPress={() => setIsOTPSent(false)}
						disabled={isLoading}
					>
						<Text>Back to Phone</Text>
					</Button>
				)}
			</View>
		</SafeAreaView>
	);
} 