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
	createUserProfile: (
		firstName: string,
		dateOfBirth: { day: string; month: string; year: string },
	) => Promise<void>;
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
	createUserProfile: async () => {},
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
		try {
			const { error } = await supabase.auth.signOut();

			if (error) {
				console.error("Error signing out:", error);
				// Force clear session even if signOut fails
				setSession(null);
				return;
			} else {
				console.log("User signed out");
				setSession(null);
			}
		} catch (error) {
			console.error("Sign out error:", error);
			// Force clear session
			setSession(null);
		}
	};

	const verifyPhone = async (phone: string) => {
		try {
			console.log("Sending verification code to:", phone);

			// Use Supabase's built-in phone verification
			const { error } = await supabase.auth.signInWithOtp({
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
					console.log(
						"New user detected - will create user record after onboarding data collection",
					);
					console.log("New user - will redirect to onboarding");
					// User record will be created after first name + DOB are collected
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

	const createUserProfile = async (
		firstName: string,
		dateOfBirth: { day: string; month: string; year: string },
	) => {
		try {
			console.log("Creating user profile with:", { firstName, dateOfBirth });

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			// Check if user already exists
			const { data: existingUser } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			if (existingUser) {
				console.log("User already exists, skipping creation");
				return;
			}

			// Format date for SQL
			const birthdate = `${dateOfBirth.year}-${dateOfBirth.month.padStart(2, "0")}-${dateOfBirth.day.padStart(2, "0")}`;

			// Create user record with minimal required data
			const { error: createError } = await supabase.from("users").insert({
				auth_user_id: session.user.id,
				email: session.user.email,
				first_name: firstName,
				birthdate: birthdate,
				gender: "other", // Default, will be updated in next screen
				created_at: new Date().toISOString(),
				updated_at: new Date().toISOString(),
			});

			if (createError) {
				console.error("Error creating user record:", createError);
				throw new Error(`Failed to create user record: ${createError.message}`);
			} else {
				console.log("User record created successfully");
			}
		} catch (error) {
			console.error("Error creating user profile:", error);
			throw error;
		}
	};

	const completeOnboarding = async (onboardingData: any) => {
		try {
			console.log("Completing onboarding with data:", onboardingData);

			if (!session?.user) {
				throw new Error("No authenticated user found");
			}

			// Update core user data (user should already exist from createUserProfile)
			if (onboardingData.user) {
				// Map gender to valid enum values
				const mapGender = (gender: string) => {
					if (!gender) return "other";
					const lowerGender = gender.toLowerCase();
					if (["male", "female", "non-binary", "other"].includes(lowerGender)) {
						return lowerGender;
					}
					return "other"; // fallback
				};

				const userData = {
					last_name: onboardingData.user.lastName || null,
					gender: mapGender(onboardingData.user.gender),
					current_location: onboardingData.user.currentLocation || null,
					updated_at: new Date().toISOString(),
				};

				console.log("Updating user data payload:", userData);

				const { error: userError } = await supabase
					.from("users")
					.update(userData)
					.eq("auth_user_id", session.user.id);

				if (userError) {
					console.error("Error updating user:", userError);
					throw new Error("Failed to update user");
				} else {
					console.log("User data updated successfully");
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

			// Map profile data to database schema
			const profilePayload = {
				user_id: user.id,
				bio: profileData.bio || null,
				height_cm: profileData.height
					? parseInt(profileData.height.replace(/\D/g, "")) || null
					: null,
				hometown: profileData.hometown || null,
				work: profileData.work || null,
				education: profileData.education || null,
				religion: profileData.religion || null,
				drinking: profileData.drinking || null,
				smoking: profileData.smoking || null,
				updated_at: new Date().toISOString(),
			};

			console.log("Profile payload:", profilePayload);

			const { error } = await supabase
				.from("user_profiles")
				.upsert(profilePayload);

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

			// Map relationship type to valid enum values
			const mapRelationshipType = (type: string) => {
				if (!type) return null;
				const lowerType = type.toLowerCase();
				if (lowerType.includes("monogamous") || lowerType.includes("exclusive"))
					return "monogamous";
				if (lowerType.includes("open")) return "open";
				if (lowerType.includes("poly")) return "polyamorous";
				return "monogamous"; // default
			};

			// Map dating intention to valid enum values
			const mapDatingIntention = (intention: string) => {
				if (!intention) return null;
				const lowerIntention = intention.toLowerCase();
				if (
					lowerIntention.includes("serious") ||
					lowerIntention.includes("relationship")
				)
					return "serious";
				if (lowerIntention.includes("casual")) return "casual";
				if (lowerIntention.includes("fun") || lowerIntention.includes("hookup"))
					return "fun";
				if (lowerIntention.includes("long") || lowerIntention.includes("term"))
					return "long_term";
				return "casual"; // default
			};

			const datingPayload = {
				user_id: user.id,
				sexuality: preferences.sexuality || null,
				relationship_type: mapRelationshipType(preferences.relationshipType),
				dating_intention: mapDatingIntention(preferences.datingIntention),
				smoking_preference: preferences.smokingPreference || null,
				drinking_preference: preferences.drinkingPreference || null,
				children_preference: preferences.childrenPreference || null,
				pet_preference: preferences.petPreference || null,
				religion_importance: preferences.religionImportance || null,
				max_distance_km: preferences.maxDistance || 20,
				age_range_min: preferences.ageRangeMin || 18,
				age_range_max: preferences.ageRangeMax || 65,
				updated_at: new Date().toISOString(),
			};

			console.log("Dating preferences payload:", datingPayload);

			const { error } = await supabase
				.from("user_dating_preferences")
				.upsert(datingPayload);

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

			const appPayload = {
				user_id: user.id,
				push_notifications: preferences.pushNotifications ?? true,
				email_notifications: preferences.emailNotifications ?? false,
				marketing_emails: preferences.marketingEmails ?? false,
				analytics_sharing: preferences.analyticsSharing ?? false,
				updated_at: new Date().toISOString(),
			};

			console.log("App preferences payload:", appPayload);

			const { error } = await supabase
				.from("user_app_preferences")
				.upsert(appPayload);

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
			await supabase.from("user_interests").delete().eq("user_id", user.id);

			// Then add new interests
			console.log("Processing interests:", interests);

			for (const interestName of interests) {
				if (!interestName || typeof interestName !== "string") {
					console.warn("Skipping invalid interest:", interestName);
					continue;
				}

				// Find or create interest
				let { data: interest, error: findError } = await supabase
					.from("interests")
					.select("id")
					.eq("name", interestName.trim())
					.single();

				if (findError && findError.code !== "PGRST116") {
					console.error("Error finding interest:", findError);
					continue;
				}

				if (!interest) {
					console.log("Creating new interest:", interestName);
					const { data: newInterest, error: createError } = await supabase
						.from("interests")
						.insert({
							name: interestName.trim(),
							category: "other",
						})
						.select("id")
						.single();

					if (createError) {
						console.error("Error creating interest:", createError);
						continue;
					}
					interest = newInterest;
				}

				if (interest) {
					const { error: linkError } = await supabase
						.from("user_interests")
						.insert({
							user_id: user.id,
							interest_id: interest.id,
							intensity_level: 3,
						});

					if (linkError) {
						console.error("Error linking user interest:", linkError);
					} else {
						console.log("Linked interest:", interestName);
					}
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
			const hasCompletedOnboarding = !!(profile && datingPrefs && appPrefs);
			console.log("Has completed onboarding:", hasCompletedOnboarding);
			return hasCompletedOnboarding;
		} catch (error) {
			console.error("Error checking user preferences:", error);
			return false;
		}
	};

	useEffect(() => {
		const initializeAuth = async () => {
			try {
				const {
					data: { session },
					error,
				} = await supabase.auth.getSession();

				if (error) {
					console.error("Error getting session:", error);
					// Clear any corrupted session
					await supabase.auth.signOut();
					setSession(null);
				} else {
					setSession(session);
				}
			} catch (error) {
				console.error("Auth initialization error:", error);
				setSession(null);
			}
		};

		initializeAuth();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (event, session) => {
			console.log("Auth state changed:", event, session?.user?.id);

			if (event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
				setSession(session);
			} else if (event === "SIGNED_IN") {
				setSession(session);
			} else {
				setSession(session);
			}
		});

		setInitialized(true);

		return () => subscription.unsubscribe();
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
				createUserProfile,
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
