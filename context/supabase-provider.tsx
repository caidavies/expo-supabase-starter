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
					throw new Error("Please use a test phone number (e.g., +15005550006) or upgrade your Twilio account");
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
				type: 'sms'
			});
			
			if (error) {
				console.error("Error verifying OTP:", error);
				throw new Error(error.message);
			}
			
			if (data.session) {
				console.log("OTP verified successfully");
				setSession(data.session);
				
				// Check if user exists in profiles table
				const { data: existingUser, error: userError } = await supabase
					.from('profiles')
					.select('*')
					.eq('id', data.user.id)
					.single();
				
				if (userError && userError.code !== 'PGRST116') {
					console.error("Error checking user profile:", userError);
				}
				
				const isNewUser = !existingUser;
				
				if (isNewUser) {
					console.log("New user - will redirect to onboarding");
					// Navigation will be handled in the component
				} else {
					console.log("Existing user - already signed in");
					// User is already signed in via session
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
			const { data: profile, error: profileError } = await supabase
				.from('profiles')
				.upsert({
					id: session.user.id,
					name: name,
					email: email,
					phone: session.user.phone,
					updated_at: new Date().toISOString(),
				})
				.select()
				.single();
			
			if (profileError) {
				console.error("Error creating profile:", profileError);
				throw new Error("Failed to create user profile");
			}
			
			console.log("Onboarding completed successfully");
			console.log("User profile created:", profile);
		} catch (error) {
			console.error("Error completing onboarding:", error);
			throw error;
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
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
