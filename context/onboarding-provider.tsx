import {
	createContext,
	PropsWithChildren,
	useContext,
	useState,
} from "react";

type OnboardingData = {
	// Core user data
	user: {
		firstName?: string;
		lastName?: string;
		dateOfBirth?: {
			day: string;
			month: string;
			year: string;
		};
		gender?: string;
		currentLocation?: string;
	} | null;
	
	// Extended profile data
	profile: {
		bio?: string;
		height?: string;
		hometown?: string;
		work?: string;
		education?: string;
		religion?: string;
		drinking?: string;
		smoking?: string;
		pronouns?: string;
		photos?: Array<{
			uri: string;
			storagePath: string;
			order: number;
			isMain: boolean;
		}>;
	} | null;
	
	// Dating preferences
	datingPreferences: {
		sexuality?: string;
		relationshipType?: string;
		datingIntention?: string;
		smokingPreference?: string;
		drinkingPreference?: string;
		childrenPreference?: string;
		petPreference?: string;
		religionImportance?: string;
		maxDistance?: number;
		ageRangeMin?: number;
		ageRangeMax?: number;
	} | null;
	
	// App preferences
	appPreferences: {
		pushNotifications?: boolean;
		emailNotifications?: boolean;
		marketingEmails?: boolean;
		analyticsSharing?: boolean;
	} | null;
	
	// Selected interests (will be linked to interests table)
	interests: string[];
};

type OnboardingState = {
	data: OnboardingData;
	updateUser: (user: Partial<OnboardingData["user"]>) => void;
	updateProfile: (profile: Partial<OnboardingData["profile"]>) => void;
	updateDatingPreferences: (preferences: Partial<OnboardingData["datingPreferences"]>) => void;
	updateAppPreferences: (preferences: Partial<OnboardingData["appPreferences"]>) => void;
	updateInterests: (interests: string[]) => void;
	clearData: () => void;
};

export const OnboardingContext = createContext<OnboardingState>({
	data: {
		user: null,
		profile: null,
		datingPreferences: null,
		appPreferences: null,
		interests: [],
	},
	updateUser: () => {},
	updateProfile: () => {},
	updateDatingPreferences: () => {},
	updateAppPreferences: () => {},
	updateInterests: () => {},
	clearData: () => {},
});

export const useOnboarding = () => useContext(OnboardingContext);

export function OnboardingProvider({ children }: PropsWithChildren) {
	const [data, setData] = useState<OnboardingData>({
		user: null,
		profile: null,
		datingPreferences: null,
		appPreferences: null,
		interests: [],
	});

	const updateUser = (user: Partial<OnboardingData["user"]>) => {
		setData(prev => ({
			...prev,
			user: prev.user ? { ...prev.user, ...user } : user,
		}));
	};

	const updateProfile = (profile: Partial<OnboardingData["profile"]>) => {
		setData(prev => ({
			...prev,
			profile: prev.profile ? { ...prev.profile, ...profile } : profile,
		}));
	};

	const updateDatingPreferences = (preferences: Partial<OnboardingData["datingPreferences"]>) => {
		setData(prev => ({
			...prev,
			datingPreferences: prev.datingPreferences ? { ...prev.datingPreferences, ...preferences } : preferences,
		}));
	};

	const updateAppPreferences = (preferences: Partial<OnboardingData["appPreferences"]>) => {
		setData(prev => ({
			...prev,
			appPreferences: prev.appPreferences ? { ...prev.appPreferences, ...preferences } : preferences,
		}));
	};

	const updateInterests = (interests: string[]) => {
		setData(prev => ({
			...prev,
			interests,
		}));
	};

	const clearData = () => {
		setData({
			user: null,
			profile: null,
			datingPreferences: null,
			appPreferences: null,
			interests: [],
		});
	};

	return (
		<OnboardingContext.Provider
			value={{
				data,
				updateUser,
				updateProfile,
				updateDatingPreferences,
				updateAppPreferences,
				updateInterests,
				clearData,
			}}
		>
			{children}
		</OnboardingContext.Provider>
	);
} 