import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';
import { useOnboarding } from "@/context/onboarding-provider";
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";
import Icon from "react-native-remix-icon";

const relationshipTypeOptions = [
  'Monogamous',
  'Polyamorous',
  'Open relationship',
  'Casual dating',
  'Friends with benefits',
  'Not sure yet'
];

export default function RelationshipTypeScreen() {
  const [selectedType, setSelectedType] = useState('');
  const { updateDatingPreferences } = useOnboarding();
  const { next, canGoNext } = useOnboardingNavigation();

  const handleNext = () => {
    if (selectedType) {
      updateDatingPreferences({ relationshipType: selectedType });
      console.log('Relationship type:', selectedType);
      next();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <View className="gap-4 items-start"> 
            <Icon name="user-heart-line" size={24} color="#212030" />
            <H1>What type of relationship are you looking for?</H1>
          </View>
        </View>

        <View className="gap-3">
          {relationshipTypeOptions.map((option) => (
            <Button
              key={option}
              variant={selectedType === option ? "default" : "outline"}
              className="w-full justify-start"
              onPress={() => setSelectedType(option)}
            >
              <Text className={selectedType === option ? "text-white" : ""}>
                {option}
              </Text>
            </Button>
          ))}
        </View>
      </View>

      <View className="gap-4 web:m-4">
        <Button
          size="lg"
          variant="default"
          onPress={handleNext}
          disabled={!selectedType}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 