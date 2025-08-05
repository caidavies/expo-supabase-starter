import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

export default function WorkScreen() {
  const [workInfo, setWorkInfo] = useState('');

  const handleNext = () => {
    if (workInfo.trim()) {
      console.log('Work info:', workInfo);
      router.push('/onboarding/screens/ReligionScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">What do you do for work?</H1>
          <Muted className="flex">
            Tell us about your job or profession.
          </Muted>
        </View>

        <View className="gap-4">
          <Input
            placeholder="Enter your job title or profession"
            value={workInfo}
            onChangeText={setWorkInfo}
            className="text-center text-lg"
          />
        </View>
      </View>

      <View className="gap-4 web:m-4">
        <Button
          size="default"
          variant="default"
          onPress={handleNext}
          disabled={!workInfo.trim()}
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 