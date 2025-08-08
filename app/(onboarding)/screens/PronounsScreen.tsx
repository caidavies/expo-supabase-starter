import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

const pronounsOptions = [
  'He/Him',
  'She/Her',
  'They/Them',
  'He/They',
  'She/They',
  'Prefer not to say'
];

export default function PronounsScreen() {
  const [selectedPronouns, setSelectedPronouns] = useState('');

  const handleNext = () => {
    if (selectedPronouns) {
      console.log('Pronouns:', selectedPronouns);
      router.push('/(onboarding)/screens/GenderScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">What are your pronouns?</H1>
          <Muted className="flex">
            This helps us address you correctly and find better matches.
          </Muted>
        </View>

        <View className="gap-3">
          {pronounsOptions.map((option) => (
            <Button
              key={option}
              variant={selectedPronouns === option ? "default" : "outline"}
              className="w-full justify-start"
              onPress={() => setSelectedPronouns(option)}
            >
              <Text className={selectedPronouns === option ? "text-white" : ""}>
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
          disabled={!selectedPronouns}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 