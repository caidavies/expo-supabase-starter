import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

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

  const handleNext = () => {
    if (selectedType) {
      console.log('Relationship type:', selectedType);
      router.push('/onboarding/screens/DatingIntentionScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">What type of relationship are you looking for?</H1>
          <Muted className="flex">
            This helps us match you with people who want the same type of relationship.
          </Muted>
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
          size="default"
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