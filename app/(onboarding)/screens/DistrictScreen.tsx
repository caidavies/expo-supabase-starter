import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useAuth } from "@/context/supabase-provider";
import { useDistricts, saveUserDistrict, type District } from "@/app/hooks/useDistricts";
import { supabase } from "@/config/supabase";

export default function DistrictScreen() {
	const { session } = useAuth();
	const [districts, setDistricts] = useState<District[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { updateProfile } = useOnboarding();

	// Load districts from database
	useEffect(() => {
		fetchDistricts();
	}, []);

	const fetchDistricts = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("areas")
				.select("*")
				.eq("is_active", true)
				.order("region", { ascending: true })
				.order("name", { ascending: true });

			if (error) {
				throw error;
			}

			setDistricts(data || []);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch districts"));
		} finally {
			setLoading(false);
		}
	};

	// Load user's existing district selection
	useEffect(() => {
		const loadUserDistrict = async () => {
			if (!session?.user?.id) return;

			try {
				const { data: userData, error: userError } = await supabase
					.from("users")
					.select("id")
					.eq("auth_user_id", session.user.id)
					.single();

				if (userError || !userData) return;

				// Try to get district from user_profiles first
				const { data: profileData, error: profileError } = await supabase
					.from("user_profiles")
					.select("current_location")
					.eq("user_id", userData.id)
					.single();

				if (!profileError && profileData?.current_location) {
					setSelectedDistrict(profileData.current_location);
				} else {
					// Fallback: check if district is stored in users table
					const { data: userProfileData, error: userProfileError } = await supabase
						.from("users")
						.select("current_location")
						.eq("id", userData.id)
						.single();

					if (!userProfileError && userProfileData?.current_location) {
						// Find the district ID by name
						const district = districts.find(d => d.name === userProfileData.current_location);
						if (district) {
							setSelectedDistrict(district.id);
						}
					}
				}
			} catch (error) {
				console.error("Error loading user district:", error);
			}
		};

		loadUserDistrict();
	}, [session?.user?.id, districts]);

	const handleDistrictSelect = (districtId: string) => {
		setSelectedDistrict(districtId === selectedDistrict ? null : districtId);
	};

	const canContinue = selectedDistrict !== null && !isSubmitting;

	const onContinue = async () => {
		if (!canContinue || !session?.user?.id) return;

		try {
			setIsSubmitting(true);
			
			// Get the user ID from the users table
			const { data: userData, error: userError } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (userError || !userData) {
				throw new Error("User profile not found");
			}

			// Get the selected district data
			const selectedDistrictData = districts.find(d => d.id === selectedDistrict);
			if (!selectedDistrictData) {
				throw new Error("Selected district not found");
			}

			// Update user profile with district using the hook function
			await saveUserDistrict(
				userData.id, 
				selectedDistrict, 
				selectedDistrictData.name, 
				selectedDistrictData.region
			);
			
			// Update onboarding context with both ID and name
			updateProfile({ 
				current_location: selectedDistrict,
				current_location_name: selectedDistrictData.name,
				district_region: selectedDistrictData.region
			});
			
			// Navigate to next screen
			// router.push("/(onboarding)/next-screen");
			
			Alert.alert("Success!", `Your district has been set to ${selectedDistrictData.name}`);
		} catch (error) {
			console.error("Error saving district:", error);
			Alert.alert("Error", "Failed to save your district. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Group districts by region
	const districtsByRegion = districts.reduce((acc, district) => {
		if (!acc[district.region]) {
			acc[district.region] = [];
		}
		acc[district.region].push(district);
		return acc;
	}, {} as Record<string, District[]>);

	// Handle loading state
	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" />
					<Text className="mt-4">Loading districts...</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Handle error state
	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-6">
					<Text className="text-red-500 mb-3">Failed to load districts</Text>
					<Button onPress={fetchDistricts}>
						<Text>Try Again</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
				<View className="mb-6">
					<H1>Where in Istanbul do you live?</H1>
					<Muted className="mt-2">
						Select your district to help us find people near you
					</Muted>
				</View>

				{Object.entries(districtsByRegion).map(([region, regionDistricts]) => (
					<View key={region} className="mb-6">
						<Text className="text-lg font-semibold text-gray-800 mb-3">{region}</Text>
						<View className="space-y-2">
							{regionDistricts.map((district) => (
								<Pressable
									key={district.id}
									onPress={() => handleDistrictSelect(district.id)}
									className={`p-4 rounded-xl border-2 ${
										selectedDistrict === district.id
											? "border-primary bg-primary/5"
											: "border-gray-200 bg-white"
									} active:opacity-80`}
									accessibilityRole="button"
									accessibilityState={{ selected: selectedDistrict === district.id }}
									accessibilityLabel={`${district.name} district`}
								>
									<View className="flex-row items-center justify-between">
										<Text
											className={`text-base font-medium ${
												selectedDistrict === district.id ? "text-primary" : "text-gray-800"
											}`}
										>
											{district.name}
										</Text>
										{selectedDistrict === district.id && (
											<View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
												<Text className="text-white text-sm">✓</Text>
											</View>
										)}
									</View>
								</Pressable>
							))}
						</View>
					</View>
				))}

				{selectedDistrict && (
					<View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<Text className="text-blue-800 text-sm">
							📍 You've selected: <Text className="font-semibold">
								{districts.find(d => d.id === selectedDistrict)?.name}
							</Text>
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Footer */}
			<View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
				<View className="flex-row items-center justify-between mb-3">
					<Text className="text-gray-600">
						District: <Text className="font-semibold">
							{selectedDistrict ? "Selected" : "Not selected"}
						</Text>
					</Text>
					{!selectedDistrict && (
						<Text className="text-gray-500">Please select a district</Text>
					)}
				</View>

				<Button
					onPress={onContinue}
					disabled={!canContinue}
					className="w-full"
				>
					<Text>
						{isSubmitting ? "Saving..." : "Continue"}
					</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}
