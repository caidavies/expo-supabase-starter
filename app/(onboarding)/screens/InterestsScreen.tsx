// InterestsScreen.tsx
import React, { useCallback, useMemo, useState } from "react";
import { Alert, ActivityIndicator, View, Text, SafeAreaView, ScrollView, RefreshControl, Pressable } from "react-native";
import { Button } from "react-native";
import { useInterests } from "@/app/hooks/useInterests"; // expect: { interests, loading, error, refetch }

type Interest = {
  id: string;
  name: string;
  icon?: string; // emoji or glyph
};

const MIN_REQUIRED = 3;

async function submitSelectedInterests(selected: string[]) {
  // TODO: replace with your API call (e.g., supabase / REST / tRPC)
  // Example:
  // await supabase.from('profiles').update({ interests: selected }).eq('id', userId);
  return new Promise((resolve) => setTimeout(resolve, 600));
}

export default function InterestsScreen() {
  const { interests = [], loading, error, refetch } = useInterests() as {
    interests: Interest[];
    loading: boolean;
    error?: Error | null;
    refetch?: () => Promise<any> | void;
  };

  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const toggleInterest = useCallback((id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, []);

  const canContinue = useMemo(
    () => selectedInterests.length >= MIN_REQUIRED && !submitting,
    [selectedInterests.length, submitting]
  );

  const onContinue = useCallback(async () => {
    try {
      setSubmitting(true);
      await submitSelectedInterests(selectedInterests);
      // Navigate onward in your onboarding flow
      // @ts-ignore – replace "Onboarding.Next" with your actual route
      // navigation.navigate("Onboarding.Next");
    } catch (e: any) {
      Alert.alert("Ops!", "We konden je interesses niet opslaan. Probeer het nog eens.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedInterests]);

  const onRetry = useCallback(() => {
    if (refetch) return refetch();
    // Fallback if hook doesn't expose refetch
    Alert.alert("Retry", "Sluit en heropen de app om het nogmaals te proberen.");
  }, [refetch]);

  const onRefresh = useCallback(async () => {
    if (!refetch) return;
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

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
        <Button title="Opnieuw proberen" onPress={onRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 p-4">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          refreshControl={
            refetch ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            ) : undefined
          }
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <Text className="text-2xl font-bold">What are you into?</Text>
          <Text className="text-gray-500 mt-1">Choose a minimum of {MIN_REQUIRED} interests</Text>

          <View className="flex-row flex-wrap gap-2 mt-6">
            {interests.map((interest) => {
              const selected = selectedInterests.includes(interest.id);
              return (
                <Pressable
                  key={interest.id}
                  onPress={() => toggleInterest(interest.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${interest.name}${selected ? " geselecteerd" : ""}`}
                  className={`px-4 py-2 rounded-full border ${
                    selected ? "bg-primary border-primary" : "bg-transparent border-gray-300"
                  }`}
                >
                  <Text className={selected ? "text-white" : "text-gray-800"}>
                    {interest.icon ? `${interest.icon} ` : ""}{interest.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Footer / CTA */}
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-gray-200">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-gray-600">
              Geselecteerd: <Text className="font-semibold">{selectedInterests.length}</Text> / {MIN_REQUIRED}+
            </Text>
            {selectedInterests.length < MIN_REQUIRED && (
              <Text className="text-gray-500">Nog {MIN_REQUIRED - selectedInterests.length} te gaan</Text>
            )}
          </View>

          <Pressable
            onPress={onContinue}
            disabled={!canContinue}
            className={`w-full items-center justify-center rounded-xl py-4 ${
              canContinue ? "bg-primary" : "bg-gray-300"
            }`}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canContinue, busy: submitting }}
            accessibilityLabel="Doorgaan"
          >
            {submitting ? (
              <ActivityIndicator />
            ) : (
              <Text className={`text-center font-semibold ${canContinue ? "text-white" : "text-gray-600"}`}>
                Doorgaan
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
