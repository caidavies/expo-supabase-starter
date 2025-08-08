import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';
import { useOnboarding } from '@/context/onboarding-provider';

const sexualityOptions = [
  'Men',
  'Women',
  'Non-Binary'
];

export default function SexualityScreen() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const { updateProfile } = useOnboarding();

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    if (selectedOptions.length > 0) {
      // Store sexuality in onboarding context
      updateProfile({ sexuality: selectedOptions.join(', ') });
      console.log('Sexuality saved:', selectedOptions);
      router.push('/(onboarding)/screens/RelationshipTypeScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">Who are you attracted to?</H1>
          <Muted className="flex">
            Select all that apply to help us find better matches.
          </Muted>
        </View>

        <View className="gap-3">
          {sexualityOptions.map((option) => (
            <Button
              key={option}
              variant={selectedOptions.includes(option) ? "default" : "outline"}
              className="w-full justify-start"
              onPress={() => handleOptionToggle(option)}
            >
              <Text className={selectedOptions.includes(option) ? "text-white" : ""}>
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
          disabled={selectedOptions.length === 0}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 