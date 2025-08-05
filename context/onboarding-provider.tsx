import {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from "react";

type OnboardingData = {
	profile: {
		name: string;
		email: string;
	} | null;
	preferences: string[];
};

type OnboardingState = {
	data: OnboardingData;
	updateProfile: (profile: { name: string; email: string }) => void;
	updatePreferences: (preferences: string[]) => void;
	clearData: () => void;
};

export const OnboardingContext = createContext<OnboardingState>({
	data: {
		profile: null,
		preferences: [],
	},
	updateProfile: () => {},
	updatePreferences: () => {},
	clearData: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export function OnboardingProvider({ children }: PropsWithChildren) {
	const [data, setData] = useState<OnboardingData>({
		profile: null,
		preferences: [],
	});

	const updateProfile = (profile: { name: string; email: string }) => {
		setData(prev => ({
			...prev,
			profile,
		}));
	};

	const updatePreferences = (preferences: string[]) => {
		setData(prev => ({
			...prev,
			preferences,
		}));
	};

	const clearData = () => {
		setData({
			profile: null,
			preferences: [],
		});
	};

	return (
		<OnboardingContext.Provider
			value={{
				data,
				updateProfile,
				updatePreferences,
				clearData,
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
} 