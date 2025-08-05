import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

const datingIntentionOptions = [
  'Casual dating',
  'Serious relationship',
  'Friendship',
  'Marriage',
  'Not sure yet'
];

export default function DatingIntentionScreen() {
  const [selectedIntention, setSelectedIntention] = useState('');

  const handleNext = () => {
    if (selectedIntention) {
      console.log('Dating intention:', selectedIntention);
      router.push('/onboarding/screens/HeightScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">What is your dating intention?</H1>
          <Muted className="flex">
            This helps us match you with people looking for the same thing.
          </Muted>
        </View>

        <View className="gap-3">
          {datingIntentionOptions.map((option) => (
            <Button
              key={option}
              variant={selectedIntention === option ? "default" : "outline"}
              className="w-full justify-start"
              onPress={() => setSelectedIntention(option)}
            >
              <Text className={selectedIntention === option ? "text-white" : ""}>
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
          disabled={!selectedIntention}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 