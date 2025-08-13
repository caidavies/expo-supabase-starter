import React, { useState, useCallback, useEffect } from "react";
import { View, ScrollView, Pressable, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useOnboarding } from "@/context/onboarding-provider";
import { useAuth } from "@/context/supabase-provider";
import { useDistricts, saveUserDatingAreas, getUserDatingAreas, type District } from "@/app/hooks/useDistricts";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";

import { supabase } from "@/config/supabase";

export default function DatingAreasScreen() {
	const { session } = useAuth();
	const { districts, loading, error, refetch } = useDistricts();
	const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { updateProfile } = useOnboarding();
	const { next } = useOnboardingNavigation();

	const MIN_AREAS = 1;
	const MAX_AREAS = 10;

	// Load user's existing dating area preferences
	useEffect(() => {
		const loadUserDatingAreas = async () => {
			if (!session?.user?.id) return;

			try {
				const { data: userData, error: userError } = await supabase
					.from("users")
					.select("id")
					.eq("auth_user_id", session.user.id)
					.single();

				if (userError || !userData) return;

				// Get existing dating areas using the helper function
				const existingAreas = await getUserDatingAreas(userData.id);

				// Convert area names back to IDs
				const areaIds = existingAreas
					.map((areaName: string) => {
						const district = districts.find(d => d.name === areaName);
						return district?.id;
					})
					.filter(Boolean);

				setSelectedAreas(areaIds);
			} catch (error) {
				console.error("Error loading user dating areas:", error);
			}
		};

		if (districts.length > 0) {
			loadUserDatingAreas();
		}
	}, [session?.user?.id, districts]);

	const toggleArea = useCallback((areaId: string) => {
		setSelectedAreas(prev => {
			if (prev.includes(areaId)) {
				// Remove area
				return prev.filter(id => id !== areaId);
			} else {
				// Add area if under limit
				if (prev.length >= MAX_AREAS) {
					return prev; // Don't add if at limit
				}
				return [...prev, areaId];
			}
		});
	}, []);

	const canContinue = selectedAreas.length >= MIN_AREAS && !isSubmitting;

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

			// Get the selected area names
			const selectedAreaNames = selectedAreas
				.map(areaId => districts.find(d => d.id === areaId)?.name)
				.filter(Boolean);

			// Save dating areas to both tables using the helper function
			await saveUserDatingAreas(userData.id, selectedAreaNames);

			// Update onboarding context
			updateProfile({ 
				preferred_dating_areas: selectedAreas,
				preferred_dating_area_names: selectedAreaNames
			});

			// Navigate to next screen using the navigation system
			next();
		} catch (error) {
			console.error("Error saving dating areas:", error);
			Alert.alert("Error", "Failed to save your dating areas. Please try again.");
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

	return (
		<SafeAreaView className="flex-1 bg-background">
			<ScrollView className="flex-1 p-4" contentContainerStyle={{ paddingBottom: 120 }}>
				<View className="mb-6">
					<H1>Where would you like to date?</H1>
					<Muted className="mt-2">
						Select areas in Istanbul where you'd be open to meeting people
					</Muted>
				</View>

				{Object.entries(districtsByRegion).map(([region, regionDistricts]) => (
					<View key={region} className="mb-6">
						<Text className="text-lg font-semibold text-gray-800 mb-3">{region}</Text>

						<View className="space-y-2">
							{regionDistricts.map((district) => {
								const isSelected = selectedAreas.includes(district.id);

								return (
									<Pressable
										key={district.id}
										onPress={() => toggleArea(district.id)}
										className={`p-4 rounded-xl border-2 mb-2 ${
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
					</View>
				))}

				{selectedAreas.length > 0 && (
					<View className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
						<Text className="text-blue-800 text-sm">
							📍 You've selected <Text className="font-semibold">{selectedAreas.length}</Text> area{selectedAreas.length !== 1 ? 's' : ''}:{' '}
							<Text className="font-semibold">
								{selectedAreas
									.map(areaId => districts.find(d => d.id === areaId)?.name)
									.filter(Boolean)
									.join(', ')}
							</Text>
						</Text>
					</View>
				)}

				{selectedAreas.length >= MAX_AREAS && (
					<View className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
						<Text className="text-orange-800 text-sm">
							⚠️ You've reached the maximum of {MAX_AREAS} areas. Deselect some areas if you want to add others.
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Footer */}
			<View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
				<View className="flex-row items-center justify-between mb-3">
					<Text className="text-gray-600">
						Areas: <Text className="font-semibold">{selectedAreas.length}</Text> / {MAX_AREAS}
					</Text>
					{selectedAreas.length < MIN_AREAS && (
						<Text className="text-gray-500">Select at least {MIN_AREAS} area</Text>
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
