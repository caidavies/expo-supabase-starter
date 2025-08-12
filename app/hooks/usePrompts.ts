import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";

export interface Prompt {
	id: string;
	question: string;
	category: string;
	is_active: boolean;
	created_at: string;
}

export interface UserPrompt {
	id: string;
	prompt_id: string;
	answer: string;
	order_index: number;
	created_at: string;
	updated_at: string;
}

export function usePrompts() {
	const [prompts, setPrompts] = useState<Prompt[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		fetchPrompts();
	}, []);

	const fetchPrompts = async () => {
		try {
			setLoading(true);
			const { data, error } = await supabase
				.from("prompts")
				.select("*")
				.order("category", { ascending: true })
				.order("question", { ascending: true });

			if (error) {
				throw error;
			}

			setPrompts(data || []);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch prompts"));
		} finally {
			setLoading(false);
		}
	};

	const refetch = () => {
		fetchPrompts();
	};

	return { prompts, loading, error, refetch };
}

export async function fetchUserPrompts(userId: string): Promise<UserPrompt[]> {
	try {
		const { data, error } = await supabase
			.from("user_prompts")
			.select("*")
			.eq("user_id", userId)
			.order("order_index", { ascending: true });

		if (error) {
			throw error;
		}

		return data || [];
	} catch (error) {
		console.error("Error fetching user prompts:", error);
		throw error;
	}
}

export async function saveUserPrompts(userId: string, userPrompts: Omit<UserPrompt, "id" | "created_at" | "updated_at">[]) {
	try {
		// Delete existing prompts for this user
		const { error: deleteError } = await supabase
			.from("user_prompts")
			.delete()
			.eq("user_id", userId);

		if (deleteError) {
			throw deleteError;
		}

		// Insert new prompts
		if (userPrompts.length > 0) {
			const { error: insertError } = await supabase
				.from("user_prompts")
				.insert(userPrompts);

			if (insertError) {
				throw insertError;
			}
		}

		return { success: true };
	} catch (error) {
		console.error("Error saving user prompts:", error);
		throw error;
	}
}
