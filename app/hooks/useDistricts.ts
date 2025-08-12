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
