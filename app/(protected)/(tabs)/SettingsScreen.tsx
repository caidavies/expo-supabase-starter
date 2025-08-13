import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Image } from "react-native";
import { SafeAreaView } from "@/components/safe-area-view";
import { useAuth } from "@/context/supabase-provider";
import { useLayoutEffect } from "react";
import { useNavigation } from "expo-router";
import { supabase } from "@/config/supabase";

interface UserProfile {
	id: string;
	first_name: string;
	last_name: string;
	date_of_birth: string;
	gender: string;
	pronouns: string;
	height: number;
	hometown: string;
	current_location: string;
	work: string;
	religion: string;
	sexuality: string;
	smoking: string;
	drinking: string;
	family_plans: string;
	relationship_type: string;
	preferred_dating_areas: string[];
	photos: string[];
}

interface UserInterest {
	id: string;
	name: string;
}

export default function SettingsScreen() {
	const { signOut, session } = useAuth();
	const navigation = useNavigation();
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [interests, setInterests] = useState<UserInterest[]>([]);
	const [loading, setLoading] = useState(true);

	useLayoutEffect(() => {
		navigation.setOptions({
			headerTitle: "Profile & Settings",
		});
	}, [navigation]);

	useEffect(() => {
		if (session?.user?.id) {
			fetchUserProfile();
			fetchUserInterests();
		}
	}, [session]);

	const fetchUserProfile = async () => {
		try {
			const { data: userData } = await supabase
				.from("users")
				.select("*")
				.eq("id", session?.user?.id)
				.single();

			const { data: profileData } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("user_id", session?.user?.id)
				.single();

			if (userData && profileData) {
				setProfile({
					...profileData,
					...userData,
				});
			}
		} catch (error) {
			console.error("Error fetching profile:", error);
		} finally {
			setLoading(false);
		}
	};

	const fetchUserInterests = async () => {
		try {
			const { data } = await supabase
				.from("user_interests")
				.select(`
					interests (
						id,
						name
					)
				`)
				.eq("user_id", session?.user?.id);

			if (data) {
				setInterests(data.map(item => item.interests));
			}
		} catch (error) {
			console.error("Error fetching interests:", error);
		}
	};

	const handleSignOut = () => {
		Alert.alert(
			"Sign Out",
			"Are you sure you want to sign out?",
			[
				{ text: "Cancel", style: "cancel" },
				{ text: "Sign Out", style: "destructive", onPress: signOut }
			]
		);
	};

	if (loading) {
		return (
			<SafeAreaView className="flex-1 bg-white">
				<View className="flex-1 items-center justify-center">
					<Text>Loading profile...</Text>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<ScrollView className="flex-1 px-5">
				{/* Profile Header */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<View className="items-center mb-4">
						{profile?.photos && profile.photos.length > 0 ? (
							<Image 
								source={{ uri: profile.photos[0] }} 
								className="w-24 h-24 rounded-full mb-3"
							/>
						) : (
							<View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-3">
								<Text className="text-gray-400 text-2xl">👤</Text>
							</View>
						)}
						<TouchableOpacity className="bg-blue-500 px-4 py-2 rounded-full">
							<Text className="text-white font-semibold">Edit Photos</Text>
						</TouchableOpacity>
					</View>
					
					<Text className="text-2xl font-bold text-center mb-1">
						{profile?.first_name} {profile?.last_name}
					</Text>
					<Text className="text-gray-600 text-center">
						{profile?.age ? `${profile.age} years old` : 'Age not set'}
					</Text>
				</View>

				{/* Basic Info Section */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<Text className="text-lg font-semibold mb-4">Basic Information</Text>
					
					<View className="space-y-4">
						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Current Location</Text>
							<Text className="text-gray-900">{profile?.current_location || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Hometown</Text>
							<Text className="text-gray-900">{profile?.hometown || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Date of Birth</Text>
							<Text className="text-gray-900">{profile?.date_of_birth || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Gender</Text>
							<Text className="text-gray-900">{profile?.gender || 'Not set'}</Text>
						</View>
					</View>
				</View>

				{/* Interests Section */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<Text className="text-lg font-semibold mb-4">Interests</Text>
					{interests.length > 0 ? (
						<View className="flex-row flex-wrap">
							{interests.map((interest) => (
								<View key={interest.id} className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
									<Text className="text-blue-800 text-sm">{interest.name}</Text>
								</View>
							))}
						</View>
					) : (
						<Text className="text-gray-500">No interests selected</Text>
					)}
					<TouchableOpacity className="mt-4 bg-gray-100 px-4 py-2 rounded-full self-start">
						<Text className="text-gray-700 font-medium">Edit Interests</Text>
					</TouchableOpacity>
				</View>

				{/* Dating Preferences */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<Text className="text-lg font-semibold mb-4">Dating Preferences</Text>
					
					<View className="space-y-4">
						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Preferred Dating Areas</Text>
							<Text className="text-gray-900">
								{profile?.preferred_dating_areas?.length || 0} areas selected
							</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Relationship Type</Text>
							<Text className="text-gray-900">{profile?.relationship_type || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Family Plans</Text>
							<Text className="text-gray-900">{profile?.family_plans || 'Not set'}</Text>
						</View>
					</View>
				</View>

				{/* Lifestyle */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<Text className="text-lg font-semibold mb-4">Lifestyle</Text>
					
					<View className="space-y-4">
						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Drinking</Text>
							<Text className="text-gray-900">{profile?.drinking || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Smoking</Text>
							<Text className="text-gray-900">{profile?.smoking || 'Not set'}</Text>
						</View>

						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Religion</Text>
							<Text className="text-gray-900">{profile?.religion || 'Not set'}</Text>
						</View>
					</View>
				</View>

				{/* Settings */}
				<View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
					<Text className="text-lg font-semibold mb-4">Settings</Text>
					
					<View className="space-y-4">
						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Push Notifications</Text>
							<Switch value={true} />
						</View>
						
						<View className="flex-row items-center justify-between">
							<Text className="text-gray-700">Email Notifications</Text>
							<Switch value={false} />
						</View>
					</View>
				</View>

				{/* Sign Out Button */}
				<TouchableOpacity 
					onPress={handleSignOut}
					className="bg-red-500 py-4 rounded-2xl mb-8"
				>
					<Text className="text-white text-center font-semibold text-lg">Sign Out</Text>
				</TouchableOpacity>
			</ScrollView>
		</SafeAreaView>
	);
}