# Onboarding Flow System

This document explains how the onboarding flow system works and how to modify it.

## Overview

The onboarding flow system now uses a **simple, flat stack navigator** that lists all screens in order, just like a standard React Navigation setup. This ensures that:

1. **Back button works correctly** - Expo Router handles navigation naturally
2. **Navigation state is maintained** - No more "forgetting where you are"
3. **Flow order is enforced** - Users can only navigate in the defined sequence
4. **Standard navigation behavior** - Follows standard React Navigation patterns

## How It Works

### 1. Simple Stack Navigator

All screens are now listed directly in the main onboarding layout:

```typescript
// app/(onboarding)/_layout.tsx
<Stack>
  <Stack.Screen name="welcome" />
  <Stack.Screen name="FirstNameScreen" />
  <Stack.Screen name="DobScreen" />
  <Stack.Screen name="NotificationsScreen" />
  <Stack.Screen name="LocationScreen" />
  <Stack.Screen name="PronounsScreen" />
  <Stack.Screen name="GenderScreen" />
  <Stack.Screen name="SexualityScreen" />
  <Stack.Screen name="RelationshipTypeScreen" />
  <Stack.Screen name="DatingIntentionScreen" />
  <Stack.Screen name="HeightScreen" />
  <Stack.Screen name="FamilyPlansScreen" />
  <Stack.Screen name="HometownScreen" />
  <Stack.Screen name="WorkScreen" />
  <Stack.Screen name="ReligionScreen" />
  <Stack.Screen name="DrinkingScreen" />
  <Stack.Screen name="SmokingScreen" />
  <Stack.Screen name="InterestsScreen" />
  <Stack.Screen name="PhotoSelectionScreen" />
  <Stack.Screen name="PromptsScreen" />
  <Stack.Screen name="complete" />
</Stack>
```

### 2. Flow Configuration

The onboarding flow order is defined in `context/onboarding-provider.tsx`:

```typescript
export const ONBOARDING_FLOW = [
	"welcome",
	"FirstNameScreen",
	"DobScreen",
	"NotificationsScreen",
	"LocationScreen",
	"PronounsScreen",
	"GenderScreen",
	"SexualityScreen",
	"RelationshipTypeScreen",
	"DatingIntentionScreen",
	"HeightScreen",
	"FamilyPlansScreen",
	"HometownScreen",
	"WorkScreen",
	"ReligionScreen",
	"DrinkingScreen",
	"SmokingScreen",
	"InterestsScreen",
	"PhotoSelectionScreen",
	"PromptsScreen",
	"complete",
] as const;
```

### 3. Navigation Methods

The system provides navigation methods through the `useOnboardingNavigation` hook:

- **`next()`** - Go to the next screen in the flow
- **`goTo(screen)`** - Jump to a specific screen
- **`canGoNext`** - Check if user can go to next screen
- **`canGoPrevious`** - Check if user can go to previous screen

## Key Benefits of This Approach

### ✅ **Simple and Reliable**
- No complex nested navigation structures
- Standard stack navigator behavior
- Back button works exactly as expected

### ✅ **Easy to Modify**
- Add/remove/reorder screens by editing the stack
- No complex navigation logic to debug
- Standard React Navigation patterns

### ✅ **Flow Order Enforcement**
- Still enforces the defined screen sequence
- Prevents users from jumping to random screens
- Easy to modify by editing the flow array

## Usage in Screens

### Basic Navigation

```typescript
import { useOnboardingNavigation } from "@/hooks/useOnboardingNavigation";

export default function MyScreen() {
	const { next, canGoNext } = useOnboardingNavigation();
	
	return (
		<View>
			{canGoNext && (
				<Button onPress={next}>Next</Button>
			)}
		</View>
	);
}
```

### Conditional Navigation

```typescript
const handleNext = () => {
	if (formIsValid) {
		// Save data first
		updateUser({ firstName });
		// Then navigate
		next();
	}
};
```

### Jump to Specific Screen

```typescript
const { goTo } = useOnboardingNavigation();

// Jump to a specific screen (useful for skip logic)
const skipToInterests = () => {
	goTo("InterestsScreen");
};
```

## Modifying the Flow

### Adding a New Screen

1. **Add to the flow array**:
```typescript
export const ONBOARDING_FLOW = [
	// ... existing screens
	"NewScreenName",
	// ... rest of screens
] as const;
```

2. **Create the screen file** in `app/(onboarding)/NewScreenName.tsx`

3. **Add to the stack navigator** in `app/(onboarding)/_layout.tsx`:
```typescript
<Stack.Screen name="NewScreenName" />
```

### Reordering Screens

1. **Reorder in the flow array** to change the sequence
2. **Reorder in the stack navigator** to match the flow

### Removing a Screen

1. Remove from `ONBOARDING_FLOW` array
2. Delete the screen file
3. Remove from the stack navigator

## Migration from Old System

If you have existing screens using `router.push()`, replace them with the navigation methods:

```typescript
// Old way
router.push("/(onboarding)/screens/DobScreen");

// New way
const { next } = useOnboardingNavigation();
next();
```

## Troubleshooting

### Screen Not Found
- Ensure the screen name is in the `ONBOARDING_FLOW` array
- Check that the screen file exists in `app/(onboarding)/`
- Verify the screen is added to the stack navigator

### Navigation Not Working
- Make sure you're using the `useOnboardingNavigation` hook
- Check that the screen is wrapped in the `OnboardingProvider`
- Verify the screen name matches exactly (case-sensitive)

### Back Button Issues
- **The back button now works naturally** with the flat stack structure
- No more complex navigation logic to interfere
- Standard React Navigation back button behavior

## Current Flow Order

1. **welcome** - Welcome screen
2. **FirstNameScreen** - Enter first name
3. **DobScreen** - Enter date of birth
4. **NotificationsScreen** - Notification preferences
5. **LocationScreen** - Current location
6. **DatingAreasScreen** - Select preferred dating areas in Istanbul
7. **PronounsScreen** - Preferred pronouns
8. **GenderScreen** - Gender identity
9. **SexualityScreen** - Sexual orientation
10. **RelationshipTypeScreen** - Relationship preferences
11. **DatingIntentionScreen** - Dating intentions
12. **HeightScreen** - Height information
13. **FamilyPlansScreen** - Family planning preferences
14. **HometownScreen** - Hometown information
15. **WorkScreen** - Work information
16. **ReligionScreen** - Religious beliefs
17. **DrinkingScreen** - Drinking preferences
18. **SmokingScreen** - Smoking preferences
19. **InterestsScreen** - Select interests
20. **PhotoSelectionScreen** - Upload photos
21. **PromptsScreen** - Answer prompts
22. **complete** - Completion screen

## Technical Implementation

The system now works by:

1. **Flat stack navigator** - All screens listed in order
2. **Simple navigation** - `router.push()` to next screen
3. **Natural back button** - Expo Router handles back navigation
4. **Flow enforcement** - Hook ensures screens follow the defined order

This approach gives you **simple, reliable navigation** that works exactly like standard React Navigation, while still maintaining the structured flow order.
