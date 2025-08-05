import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { router } from 'expo-router';

import { SafeAreaView } from '@/components/safe-area-view';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form';
import { Text } from '@/components/ui/text';
import { H1, Muted } from '@/components/ui/typography';

export default function DobScreen() {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  const handleNext = () => {
    if (day.trim() && month.trim() && year.trim()) {
      const dateOfBirth = `${month}/${day}/${year}`;
      console.log('Date of birth:', dateOfBirth);
      router.push('/onboarding/screens/GenderScreen');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={16}
      >
        <View className="flex-1 gap-6 py-24 web:m-4">
          <View className="gap-4">
            <H1 className="self-start">What&apos;s your date of birth?</H1>
            <Muted className="flex">
              We use this to show your age and find people in your age range.
            </Muted>
          </View>

          <View className="gap-4">
            <View className="flex-row gap-3">
              <FormInput
                label="Day"
                placeholder="DD"
                value={day}
                onChangeText={setDay}
                keyboardType="numeric"
                autoCorrect={false}
                className="flex-1"
              />
              <FormInput
                label="Month"
                placeholder="MM"
                value={month}
                onChangeText={setMonth}
                keyboardType="numeric"
                autoCorrect={false}
                className="flex-1"
              />
              <FormInput
                label="Year"
                placeholder="YYYY"
                value={year}
                onChangeText={setYear}
                keyboardType="numeric"
                autoCorrect={false}
                className="flex-1"
              />
            </View>
          </View>
        </View>

        <View className="gap-4 web:m-4">
          <Button
            size="default"
            variant="default"
            onPress={handleNext}
            disabled={!day.trim() || !month.trim() || !year.trim()}
          >
            <Text>Next</Text>
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 