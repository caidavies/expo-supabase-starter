import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";

export interface District {
	id: string;
	name: string;
	region: string;
	is_active: boolean;
	created_at: string;
}

export function useDistricts() {
	const [districts, setDistricts] = useState<District[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

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

	const refetch = () => {
		fetchDistricts();
	};

	return { districts, loading, error, refetch };
}

export async function saveUserDistrict(userId: string, districtId: string, districtName: string, districtRegion: string) {
	try {
		// Update existing user_profiles record
		const { error: profileError } = await supabase
			.from("user_profiles")
			.update({
				current_location: districtId,
				updated_at: new Date().toISOString()
			})
			.eq("user_id", userId);

		if (profileError) {
			throw profileError;
		}

		// Also update users table for easy access
		const { error: userError } = await supabase
			.from("users")
			.update({
				current_location: districtName,
				updated_at: new Date().toISOString()
			})
			.eq("id", userId);

		if (userError) {
			console.warn("Warning: Could not update users table:", userError);
		}

		return { success: true };
	} catch (error) {
		console.error("Error saving user district:", error);
		throw error;
	}
}

export async function getUserDistrict(userId: string) {
	try {
		const { data, error } = await supabase
			.from("user_profiles")
			.select("current_location")
			.eq("user_id", userId)
			.single();

		if (error) {
			throw error;
		}

		return data?.current_location || null;
	} catch (error) {
		console.error("Error getting user district:", error);
		return null;
	}
}

export async function saveUserDatingAreas(userId: string, areaNames: string[]) {
	try {
		// First check if user_dating_preferences record exists
		const { data: existingPreferences } = await supabase
			.from("user_dating_preferences")
			.select("id")
			.eq("user_id", userId)
			.single();

		if (existingPreferences) {
			// Update existing record
			const { error: preferencesError } = await supabase
				.from("user_dating_preferences")
				.update({
					preferred_areas: areaNames,
					updated_at: new Date().toISOString()
				})
				.eq("user_id", userId);

			if (preferencesError) {
				throw preferencesError;
			}
		} else {
			// Insert new record only if none exists
			const { error: preferencesError } = await supabase
				.from("user_dating_preferences")
				.insert({
					user_id: userId,
					preferred_areas: areaNames,
					updated_at: new Date().toISOString()
				});

			if (preferencesError) {
				throw preferencesError;
			}
		}

		// Also save to user_profiles for quick access
		const { error: profileError } = await supabase
			.from("user_profiles")
			.update({
				preferred_dating_areas: areaNames,
				updated_at: new Date().toISOString()
			})
			.eq("user_id", userId);

		if (profileError) {
			console.warn("Warning: Could not update user_profiles table:", profileError);
		}

		return { success: true };
	} catch (error) {
		console.error("Error saving user dating areas:", error);
		throw error;
	}
}

export async function getUserDatingAreas(userId: string) {
	try {
		// Try user_dating_preferences first
		const { data: preferencesData, error: preferencesError } = await supabase
			.from("user_dating_preferences")
			.select("preferred_areas")
			.eq("user_id", userId)
			.single();

		if (!preferencesError && preferencesData?.preferred_areas) {
			return preferencesData.preferred_areas;
		}

		// Fallback to user_profiles
		const { data: profileData, error: profileError } = await supabase
			.from("user_profiles")
			.select("preferred_dating_areas")
			.eq("user_id", userId)
			.single();

		if (!profileError && profileData?.preferred_dating_areas) {
			return profileData.preferred_dating_areas;
		}

		return [];
	} catch (error) {
		console.error("Error getting user dating areas:", error);
		return [];
	}
}
