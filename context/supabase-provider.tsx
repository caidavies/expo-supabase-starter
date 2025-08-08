import {
	createContext,
	PropsWithChildren,
	useContext,
	useEffect,
	useState,
} from "react";

import { Session } from "@supabase/supabase-js";

import { supabase } from "@/config/supabase";

type AuthState = {
	initialized: boolean;
	session: Session | null;
	signUp: (email: string, password: string) => Promise<void>;
	signIn: (email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
	verifyPhone: (phone: string) => Promise<void>;
	verifyOTP: (otp: string, phone: string) => Promise<void>;
	completeOnboarding: (onboardingData: any) => Promise<void>;
	saveUserProfile: (profileData: any) => Promise<void>;
	saveDatingPreferences: (preferences: any) => Promise<void>;
	saveAppPreferences: (preferences: any) => Promise<void>;
	saveUserInterests: (interests: string[]) => Promise<void>;
	checkUserPreferences: () => Promise<boolean>;
};

export const AuthContext = createContext<AuthState>({
	initialized: false,
	session: null,
	signUp: async () => {},
	signIn: async () => {},
	signOut: async () => {},
	verifyPhone: async () => {},
	verifyOTP: async () => {},
	completeOnboarding: async () => {},
	saveUserProfile: async () => {},
	saveDatingPreferences: async () => {},
	saveAppPreferences: async () => {},
	saveUserInterests: async () => {},
	checkUserPreferences: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: PropsWithChildren) {
	const [initialized, setInitialized] = useState(false);
	const [session, setSession] = useState<Session | null>(null);

	const signUp = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		});

		if (error) {
			console.error("Error signing up:", error);
			return;
		}

		if (data.session) {
			setSession(data.session);
			console.log("User signed up:", data.user);
		} else {
			console.log("No user returned from sign up");
		}
	};

	const signIn = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			console.error("Error signing in:", error);
			return;
		}

		if (data.session) {
			setSession(data.session);
			console.log("User signed in:", data.user);
		} else {
			console.log("No user returned from sign in");
		}
	};

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			console.error("Error signing out:", error);
			return;
		} else {
			console.log("User signed out");
		}
	};

	const verifyPhone = async (phone: string) => {
		try {
			console.log("Sending verification code to:", phone);

			// Use Supabase's built-in phone verification
			const { data, error } = await supabase.auth.signInWithOtp({
				phone: phone,
			});

			if (error) {
				console.error("Error sending verification code:", error);

				// Handle test account limitations
				if (error.message.includes("Test Account Credentials")) {
					throw new Error(
						"Please use a test phone number (e.g., +15005550006) or upgrade your Twilio account",
					);
				}

				throw new Error(error.message);
			}

			console.log("Verification code sent successfully");
		} catch (error) {
			console.error("Error sending verification code:", error);
			throw error;
		}
	};

	const verifyOTP = async (otp: string, phone: string) => {
		try {
			console.log("Verifying OTP:", otp);

			// Use Supabase's built-in OTP verification
			const { data, error } = await supabase.auth.verifyOtp({
				phone: phone,
				token: otp,
				type: "sms",
			});

			if (error) {
				console.error("Error verifying OTP:", error);
				throw new Error(error.message);
			}

			if (data.session) {
				console.log("OTP verified successfully");
				setSession(data.session);

							// Check if user exists in users table
			const { data: existingUser, error: userError } = await supabase
				.from("users")
				.select("*")
				.eq("auth_user_id", data.user?.id)
				.single();

				if (userError && userError.code !== "PGRST116") {
					console.error("Error checking user profile:", userError);
				}

				const isNewUser = !existingUser;

				if (isNewUser) {
					console.log("New user detected - creating user record");
					console.log("New user - will redirect to onboarding");
					
					// Create user record since no trigger exists for this
					const { error: createError } = await supabase
						.from("users")
						.insert({
							auth_user_id: data.user?.id,
							email: data.user?.email,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						});
					
					if (createError) {
						console.error("Error creating user record:", createError);
					}
					// Navigation will be handled in the component
				} else {
					console.log("Existing user - already signed in");
					// Check if user has preferences
					const hasPreferences = await checkUserPreferences();
					if (!hasPreferences) {
						console.log(
							"Existing user has no preferences - redirecting to onboarding",
						);
						// Navigation will be handled in the component
					} else {
						console.log(
							"Existing user has preferences - redirecting to main app",
						);
						// Navigation will be handled in the component
					}
				}
			} else {
				throw new Error("Invalid verification code");
			}
		} catch (error) {
			console.error("Error verifying OTP:", error);
			throw error;
		}
	};

	const completeOnboarding = async (onboardingData: any) => {
		try {
			console.log("Completing onboarding with data:", onboardingData);

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			// Save core user data
			if (onboardingData.user) {
				const userData = {
					first_name: onboardingData.user.firstName,
					last_name: onboardingData.user.lastName,
					birthdate: onboardingData.user.dateOfBirth ? 
						`${onboardingData.user.dateOfBirth.year}-${onboardingData.user.dateOfBirth.month.padStart(2, '0')}-${onboardingData.user.dateOfBirth.day.padStart(2, '0')}` : null,
					gender: onboardingData.user.gender?.toLowerCase(),
					current_location: onboardingData.user.currentLocation,
					updated_at: new Date().toISOString(),
				};

				const { error: userError } = await supabase
					.from("users")
					.update(userData)
					.eq("auth_user_id", session.user.id);

				if (userError) {
					console.error("Error updating user:", userError);
					throw new Error("Failed to update user");
				}
			}

			// Get user ID for other tables
			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) throw new Error("User not found");

			// Save extended profile
			if (onboardingData.profile) {
				await saveUserProfile(onboardingData.profile);
			}

			// Save dating preferences
			if (onboardingData.datingPreferences) {
				await saveDatingPreferences(onboardingData.datingPreferences);
			}

			// Save app preferences
			if (onboardingData.appPreferences) {
				await saveAppPreferences(onboardingData.appPreferences);
			}

			// Save interests
			if (onboardingData.interests && onboardingData.interests.length > 0) {
				await saveUserInterests(onboardingData.interests);
			}

			console.log("Onboarding completed successfully");
		} catch (error) {
			console.error("Error completing onboarding:", error);
			throw error;
		}
	};

	const saveUserProfile = async (profileData: any) => {
		try {
			console.log("=== SAVING USER PROFILE ===");

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) throw new Error("User not found");

			const { error } = await supabase
				.from("user_profiles")
				.upsert({
					user_id: user.id,
					bio: profileData.bio,
					height_cm: profileData.height ? parseInt(profileData.height) : null,
					hometown: profileData.hometown,
					work: profileData.work,
					education: profileData.education,
					religion: profileData.religion,
					drinking: profileData.drinking,
					smoking: profileData.smoking,
					updated_at: new Date().toISOString(),
				});

			if (error) throw new Error("Failed to save profile");
			console.log("Profile saved successfully");
		} catch (error) {
			console.error("Error saving profile:", error);
			throw error;
		}
	};

	const saveDatingPreferences = async (preferences: any) => {
		try {
			console.log("=== SAVING DATING PREFERENCES ===");

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) throw new Error("User not found");

			const { error } = await supabase
				.from("user_dating_preferences")
				.upsert({
					user_id: user.id,
					sexuality: preferences.sexuality,
					relationship_type: preferences.relationshipType?.toLowerCase(),
					dating_intention: preferences.datingIntention?.toLowerCase(),
					smoking_preference: preferences.smokingPreference,
					drinking_preference: preferences.drinkingPreference,
					children_preference: preferences.childrenPreference,
					pet_preference: preferences.petPreference,
					religion_importance: preferences.religionImportance,
					max_distance_km: preferences.maxDistance || 20,
					age_range_min: preferences.ageRangeMin || 18,
					age_range_max: preferences.ageRangeMax || 65,
					updated_at: new Date().toISOString(),
				});

			if (error) throw new Error("Failed to save dating preferences");
			console.log("Dating preferences saved successfully");
		} catch (error) {
			console.error("Error saving dating preferences:", error);
			throw error;
		}
	};

	const saveAppPreferences = async (preferences: any) => {
		try {
			console.log("=== SAVING APP PREFERENCES ===");

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) throw new Error("User not found");

			const { error } = await supabase
				.from("user_app_preferences")
				.upsert({
					user_id: user.id,
					push_notifications: preferences.pushNotifications ?? true,
					email_notifications: preferences.emailNotifications ?? false,
					marketing_emails: preferences.marketingEmails ?? false,
					analytics_sharing: preferences.analyticsSharing ?? false,
					updated_at: new Date().toISOString(),
				});

			if (error) throw new Error("Failed to save app preferences");
			console.log("App preferences saved successfully");
		} catch (error) {
			console.error("Error saving app preferences:", error);
			throw error;
		}
	};

	const saveUserInterests = async (interests: string[]) => {
		try {
			console.log("=== SAVING USER INTERESTS ===");

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) throw new Error("User not found");

			// First, remove existing interests
			await supabase
				.from("user_interests")
				.delete()
				.eq("user_id", user.id);

			// Then add new interests
			for (const interestName of interests) {
				// Find or create interest
				let { data: interest } = await supabase
					.from("interests")
					.select("id")
					.eq("name", interestName)
					.single();

				if (!interest) {
					const { data: newInterest } = await supabase
						.from("interests")
						.insert({ name: interestName, category: "other" })
						.select("id")
						.single();
					interest = newInterest;
				}

				if (interest) {
					await supabase
						.from("user_interests")
						.insert({
							user_id: user.id,
							interest_id: interest.id,
							intensity_level: 3,
						});
				}
			}

			console.log("Interests saved successfully");
		} catch (error) {
			console.error("Error saving interests:", error);
			throw error;
		}
	};

	const checkUserPreferences = async () => {
		try {
			console.log("=== CHECKING USER PREFERENCES ===");

			if (!session?.user) {
				return false;
			}

			const { data: user } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (!user) return false;

			// Check if user has completed profile setup
			const { data: profile } = await supabase
				.from("user_profiles")
				.select("*")
				.eq("user_id", user.id)
				.single();

			const { data: datingPrefs } = await supabase
				.from("user_dating_preferences")
				.select("*")
				.eq("user_id", user.id)
				.single();

			const { data: appPrefs } = await supabase
				.from("user_app_preferences")
				.select("*")
				.eq("user_id", user.id)
				.single();

			// User has completed onboarding if they have at least profile and dating preferences
			const hasCompletedOnboarding = !!(profile && datingPrefs);
			console.log("Has completed onboarding:", hasCompletedOnboarding);
			return hasCompletedOnboarding;
		} catch (error) {
			console.error("Error checking user preferences:", error);
			return false;
		}
	};

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		setInitialized(true);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				initialized,
				session,
				signUp,
				signIn,
				signOut,
				verifyPhone,
				verifyOTP,
				completeOnboarding,
				saveUserProfile,
				saveDatingPreferences,
				saveAppPreferences,
				saveUserInterests,
				checkUserPreferences,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
