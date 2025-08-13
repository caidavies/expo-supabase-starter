import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useAuth } from "@/context/supabase-provider";
import { useDistricts, saveUserDistrict, getUserDistrict, type District } from "@/app/hooks/useDistricts";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { supabase } from "@/config/supabase";
import Icon from "react-native-remix-icon";

export default function LocationScreen() {
	const { session } = useAuth();
	const { districts, loading, error, refetch } = useDistricts();
	const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { updateUser } = useOnboarding();
	const { next } = useOnboardingNavigation();

	// Load user's existing location
	useEffect(() => {
		const loadUserLocation = async () => {
			if (!session?.user?.id) return;

			try {
				const { data: userData, error: userError } = await supabase
					.from("users")
					.select("id")
					.eq("auth_user_id", session.user.id)
					.single();

				if (userError || !userData) return;

				const existingLocation = await getUserDistrict(userData.id);
				if (existingLocation) {
					setSelectedLocation(existingLocation);
				}
			} catch (error) {
				console.error("Error loading user location:", error);
			}
		};

		if (districts.length > 0) {
			loadUserLocation();
		}
	}, [session?.user?.id, districts]);

	const selectLocation = useCallback((locationId: string) => {
		setSelectedLocation(locationId);
	}, []);

	const canContinue = selectedLocation && !isSubmitting;

	const handleNext = async () => {
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

			// Get the selected location details
			const selectedDistrict = districts.find(d => d.id === selectedLocation);
			if (!selectedDistrict) {
				throw new Error("Selected location not found");
			}

			// Save location to both tables
			await saveUserDistrict(userData.id, selectedLocation, selectedDistrict.name, selectedDistrict.region);

			// Update onboarding context
			updateUser({ 
				currentLocation: selectedDistrict.name,
			});

			console.log("Location saved:", selectedDistrict.name);
			next();
		} catch (error) {
			console.error("Error saving location:", error);
			Alert.alert("Error", "Failed to save your location. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Handle loading state
	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center">
					<ActivityIndicator size="large" />
					<Text className="mt-4">Loading areas...</Text>
				</View>
			</SafeAreaView>
		);
	}

	// Handle error state
	if (error) {
		return (
			<SafeAreaView className="flex-1 bg-background">
				<View className="flex-1 justify-center items-center p-6">
					<Text className="text-red-500 mb-3">Failed to load areas</Text>
					<Button onPress={refetch}>
						<Text>Try Again</Text>
					</Button>
				</View>
			</SafeAreaView>
		);
	}

	// Sort districts alphabetically by name
	const sortedDistricts = [...districts].sort((a, b) => a.name.localeCompare(b.name));

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
				<View className="mb-6 gap-6">
					<Icon name="user-location-line" size={24} color="#212030" />
					<H1>Where are you located?</H1>
					<Muted className="mt-2">
						Select your current location to help us find matches near you
					</Muted>
				</View>

				<View className="space-y-2">
					{sortedDistricts.map((district) => {
						const isSelected = selectedLocation === district.id;

						return (
							<Pressable
								key={district.id}
								onPress={() => selectLocation(district.id)}
								className={`p-4 rounded-full border-2 mb-2 ${
									isSelected
										? "border-primary bg-primary/5"
										: "border-gray-200 bg-white"
								} active:opacity-80`}
								accessibilityRole="button"
								accessibilityState={{ selected: isSelected }}
								accessibilityLabel={`${district.name} area`}
							>
								<View className="flex-row items-center justify-between">
									<Text
										className={`text-base font-medium ${
											isSelected ? "text-primary" : "text-gray-800"
										}`}
									>
										{district.name}
									</Text>
									{isSelected && (
										<View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
											<Text className="text-white text-sm">✓</Text>
										</View>
									)}
								</View>
							</Pressable>
						);
					})}
				</View>

				{selectedLocation && (
					<View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<Text className="text-blue-800 text-sm">
							�� You've selected: <Text className="font-semibold">
								{districts.find((d) => d.id === selectedLocation)?.name}
							</Text>
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Footer */}
			<View className="absolute bottom-0 left-0 right-0 p-4 pb-12 bg-background border-t border-gray-200">
				<Button onPress={handleNext} disabled={!canContinue} size="lg" className="w-full">
					<Text>{isSubmitting ? "Saving..." : "Next"}</Text>
				</Button>
			</View>
		</SafeAreaView>
	);
}