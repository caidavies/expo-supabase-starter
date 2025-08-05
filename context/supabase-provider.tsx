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
	completeOnboarding: (name: string, email: string) => Promise<void>;
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
					
					// Create user record in users table
					const { data: newUser, error: createUserError } = await supabase
						.from("users")
						.insert({
							auth_user_id: data.user?.id,
							email: data.user?.email || null,
							created_at: new Date().toISOString(),
							updated_at: new Date().toISOString(),
						})
						.select()
						.single();
					
					if (createUserError) {
						console.error("Error creating user record:", createUserError);
					} else {
						console.log("User record created successfully:", newUser);
					}
					
					console.log("New user - will redirect to onboarding");
					// Navigation will be handled in the component
				} else {
					console.log("Existing user - already signed in");
					// Check if user has preferences
					const hasPreferences = await checkUserPreferences();
					if (!hasPreferences) {
						console.log("Existing user has no preferences - redirecting to onboarding");
						// Navigation will be handled in the component
					} else {
						console.log("Existing user has preferences - redirecting to main app");
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

	const completeOnboarding = async (name: string, email: string) => {
		try {
			console.log("Completing onboarding for:", name, email);
			
			if (!session?.user) {
				throw new Error("No authenticated user found");
			}
			
			// Create or update user profile in Supabase
			const { data: user, error: userError } = await supabase
				.from('users')
				.upsert({
					auth_user_id: session.user.id,
					email: email,
					first_name: name.split(' ')[0] || name,
					last_name: name.split(' ').slice(1).join(' ') || null,
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();
			
			if (userError) {
				console.error("Error creating user:", userError);
				throw new Error("Failed to create user profile");
			}
			
			console.log("Onboarding completed successfully");
			console.log("User profile created:", user);
		} catch (error) {
			console.error("Error completing onboarding:", error);
			throw error;
		}
	};

	const checkUserPreferences = async () => {
		try {
			console.log("=== CHECKING USER PREFERENCES ===");
			console.log("Session user ID:", session?.user?.id);
			
			if (!session?.user) {
				console.log("No session user found");
				return false;
			}

			// First get the user record to get the user_id
			const { data: user, error: userError } = await supabase
				.from("users")
				.select("id")
				.eq("auth_user_id", session.user.id)
				.single();

			console.log("=== USER LOOKUP ===");
			console.log("Looking for user with auth_user_id:", session.user.id);
			console.log("User data:", user);
			console.log("User error:", userError);

			if (userError) {
				console.error("Error getting user:", userError);
				return false;
			}

			console.log("Found user ID:", user.id);

			// Check if user has preferences
			const { data, error } = await supabase
				.from("user_preferences")
				.select("*")
				.eq("user_id", user.id)
				.single();

			console.log("=== PREFERENCES LOOKUP ===");
			console.log("Looking for preferences with user_id:", user.id);
			console.log("Preferences data:", data);
			console.log("Preferences error:", error);

			if (error && error.code !== "PGRST116") {
				console.error("Error checking user preferences:", error);
				return false;
			}

			const hasPreferences = !!data;
			console.log("Final result - has preferences:", hasPreferences);
			return hasPreferences;
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
				checkUserPreferences,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
