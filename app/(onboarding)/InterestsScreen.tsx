// InterestsScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ActivityIndicator, View, Text, SafeAreaView, ScrollView, Pressable } from "react-native";
import { Button } from "@/components/ui/button";
import { useInterests } from "@/app/hooks/useInterests"; // expect: { interests, loading, error, refetch }
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import { H1, Muted } from "@/components/ui/typography";
import Icon from "react-native-remix-icon";


type Interest = {
  id: string;
  name: string;
  icon?: string;     // emoji or glyph
  category?: string; // <-- add this (e.g., "Mindfulness", "Fitness", "Creativity")
};

const MIN_REQUIRED = 3;
const MAX_ALLOWED = 10;

async function submitSelectedInterests(
	userId: string,
	selectedInterestIds: string[],
) {
  try {
    				// Start a transaction by using multiple operations
		const { error: deleteError } = await supabase
			.from("user_interests")
			.delete()
			.eq("user_id", userId);

		if (deleteError) {
			console.error("Error deleting existing interests:", deleteError);
			throw new Error("Failed to update interests");
		}

    // Insert new interests
    if (selectedInterestIds.length > 0) {
      const interestRecords = selectedInterestIds.map(interestId => ({
        user_id: userId,
        interest_id: interestId,
        intensity_level: 3 // Default level, can be made configurable later
      }));

      const { error: insertError } = await supabase
        .from('user_interests')
        .insert(interestRecords);

      if (insertError) {
        console.error('Error inserting interests:', insertError);
        throw new Error('Failed to save interests');
      }
    }

    return { success: true };
  } catch (error) {
    console.error('Error in submitSelectedInterests:', error);
    throw error;
  }
}

export default function InterestsScreen() {
  const { session } = useAuth();
  const { interests = [], loading, error, refetch } = useInterests() as {
    interests: Interest[];
    loading: boolean;
    error?: Error | null;
    refetch?: () => Promise<any> | void;
  };
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { next, canGoNext } = useOnboardingNavigation();
  const toggleInterest = useCallback((id: string) => {
    setSelectedInterests((prev) => {
      if (prev.includes(id)) {
        // Remove interest if already selected
        return prev.filter((x) => x !== id);
      } else {
        // Only add if under the maximum limit
        if (prev.length >= MAX_ALLOWED) {
          return prev; // Don't add if at limit
        }
        return [...prev, id];
      }
    });
  }, []);

  const canContinue = useMemo(
    () => selectedInterests.length >= MIN_REQUIRED && selectedInterests.length <= MAX_ALLOWED && !submitting,
    [selectedInterests.length, submitting]
  );

  const onContinue = useCallback(async () => {
    if (!session?.user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    try {
      setSubmitting(true);
      
      // Get the user ID from the users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("auth_user_id", session.user.id)
        .single();

      if (userError || !userData) {
        throw new Error("User profile not found");
      }

      await submitSelectedInterests(userData.id, selectedInterests);
      
      // Navigate to the next onboarding screen
      next();
    } catch (e: any) {
      Alert.alert(
        "Oops!", 
        "We couldn't save your interests. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => setSubmitting(false)
          }
        ]
      );
    } finally {
      setSubmitting(false);
    }
  }, [selectedInterests, session?.user?.id]);

  const onRetry = useCallback(() => {
    if (refetch) return refetch();
    Alert.alert("Retry", "Sluit en heropen de app om het nogmaals te proberen.");
  }, [refetch]);

  // --- Group interests by category ---
  const grouped = useMemo(() => {
    const map = new Map<string, Interest[]>();
    const fallback = "Overig"; // "Other"
    for (const item of interests) {
      const key = (item.category && item.category.trim()) || fallback;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    // Sort categories alphabetically; inside each, sort by name
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, items]) => ({
        title,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [interests]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <ActivityIndicator size="large" />
        <Text className="mt-4">Interesses laden…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-background p-6">
        <Text className="text-red-500 mb-3">Interesses laden mislukt</Text>
        		<Button onPress={onRetry}>
			<Text>Opnieuw proberen</Text>
		</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top, left, right"]}>
      <View className="flex-1 p-4">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <View className="gap-4 items-start">
            <Icon name="thumb-up-line" size={24} color="#212030" />
            <H1>What are you into?</H1>
            <Muted>Choose {MIN_REQUIRED}-{MAX_ALLOWED} interests</Muted>
          </View>

          {/* Sections */}
          <View className="mt-6">
            {grouped.map((section) => (
              <View key={section.title} className="mb-8">
                <Text className="text-lg font-semibold capitalize">{section.title}</Text>
                <View className="flex-row flex-wrap gap-2 mt-3">
                  {section.items.map((interest) => {
                    const selected = selectedInterests.includes(interest.id);
                    const isDisabled = selectedInterests.length >= MAX_ALLOWED && !selected;
                    return (
                      <Pressable
                        key={interest.id}
                        onPress={() => toggleInterest(interest.id)}
                        disabled={isDisabled}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled: isDisabled }}
                        accessibilityLabel={`${interest.name}${selected ? " geselecteerd" : ""}${isDisabled ? " uitgeschakeld" : ""}`}
                        className={`px-4 py-2 rounded-full border ${
                          selected 
                            ? "bg-primary border-primary" 
                            : isDisabled 
                              ? "bg-gray-100 border-gray-200 opacity-50"
                              : "bg-transparent border-gray-300"
                        }`}
                      >
                        <Text className={
                          selected 
                            ? "text-white" 
                            : isDisabled 
                              ? "text-gray-400"
                              : "text-gray-800"
                        }>
                          {interest.icon ? `${interest.icon} ` : ""}
                          {interest.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* Footer / CTA */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
          <Button
            onPress={onContinue}
            disabled={!canContinue}
            size="lg"
            className={`w-full ${
              canContinue ? "bg-primary" : "bg-gray-300"
            }`}
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className={`text-center font-semibold ${canContinue ? "text-white" : "text-gray-600"}`}>
                Next
              </Text>
            )}
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}
