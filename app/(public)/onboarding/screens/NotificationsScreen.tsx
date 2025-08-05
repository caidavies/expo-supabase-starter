import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

const notificationOptions = [
  'New matches',
  'Messages',
  'Profile views',
  'App updates',
  'Marketing emails'
];

export default function NotificationsScreen() {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleOptionToggle = (option: string) => {
    setSelectedOptions(prev => 
      prev.includes(option) 
        ? prev.filter(item => item !== option)
        : [...prev, option]
    );
  };

  const handleNext = () => {
    console.log('Notification preferences:', selectedOptions);
    router.push('/onboarding/screens/LocationScreen');
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <View className="flex-1 gap-6 py-24 web:m-4">
        <View className="gap-4">
          <H1 className="self-start">Notification preferences</H1>
          <Muted className="flex">
            Choose what notifications you'd like to receive.
          </Muted>
        </View>

        <View className="gap-3">
          {notificationOptions.map((option) => (
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
        >
          <Text>Next</Text>
        </Button>
      </View>
    </SafeAreaView>
  );
} 