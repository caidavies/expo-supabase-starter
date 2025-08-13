import { usePathname, router } from "expo-router";
import { useOnboarding } from "@/context/onboarding-provider";

/**
 * Hook for easy onboarding navigation using Expo Router
 * Provides simple methods to navigate between onboarding screens
 */
export const useOnboardingNavigation = () => {
	const { flow } = useOnboarding();
	const pathname = usePathname();

	// Get current screen index from pathname
	const getCurrentScreenIndex = (): number => {
		if (pathname.includes("/welcome")) return 0;
		if (pathname.includes("/complete")) return flow.length - 1;

		// Check profile screens (now directly in onboarding layout)
		for (let i = 1; i < flow.length - 1; i++) {
			if (pathname.includes(flow[i])) {
				return i;
			}
		}

		return 0; // Default to welcome
	};

	const currentScreenIndex = getCurrentScreenIndex();
	const currentScreen = flow[currentScreenIndex];

	// Simple navigation using the flattened stack structure
	const next = () => {
		const nextIndex = currentScreenIndex + 1;
		if (nextIndex < flow.length) {
			const nextScreen = flow[nextIndex];
			console.log(
				`[Navigation] Going from ${currentScreen} (${currentScreenIndex}) to ${nextScreen} (${nextIndex})`,
			);

			// Navigate directly to the next screen
			router.push(`/(onboarding)/${nextScreen}`);
		}
	};

	// Don't provide a previous method - let the native back button work
	// This ensures Expo Router handles back navigation naturally

	const goTo = (screen: (typeof flow)[number]) => {
		const screenIndex = flow.indexOf(screen);
		if (screenIndex !== -1) {
			console.log(`[Navigation] Jumping to ${screen} (${screenIndex})`);

			// Navigate directly to the specified screen
			router.push(`/(onboarding)/${screen}`);
		}
	};

	return {
		// Navigation methods
		next,
		goTo,

		// State
		currentScreen,
		currentScreenIndex,

		// Navigation state
		canGoNext: currentScreenIndex < flow.length - 1,
		canGoPrevious: currentScreenIndex > 0,

		// Convenience methods
		isFirstScreen: currentScreenIndex === 0,
		isLastScreen: currentScreenIndex === flow.length - 1,
	};
};
