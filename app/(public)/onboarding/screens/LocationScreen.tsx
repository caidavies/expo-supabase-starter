import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

export default function LocationScreen() {
  const [location, setLocation] = useState('');

  const handleNext = () => {
    if (location.trim()) {
      console.log('Location:', location);
      router.push('/onboarding/screens/PronounsScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">Where are you located?</H1>
          <Muted className="flex">
            This helps us find matches near you.
          </Muted>
        </View>

        <View className="gap-4">
          <Input
            placeholder="Enter your city or location"
            value={location}
            onChangeText={setLocation}
            className="text-center text-lg"
          />
        </View>
      </View>

      <View className="gap-4 web:m-4">
        <Button
          size="default"
          variant="default"
          onPress={handleNext}
          disabled={!location.trim()}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 