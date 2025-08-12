import "../global.css";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

type UserState =
  | "loading"
  | "unauthenticated"
  | "needs-onboarding"
  | "authenticated";

function RootNavigator() {
  const { initialized, session, checkUserPreferences } = useAuth();
  const [userState, setUserState] = useState<UserState>("loading");

  useEffect(() => {
    const determineUserState = async () => {
      if (!initialized) return;

      console.log("=== DETERMINING USER STATE ===");

      if (!session) {
        console.log("No session - user is unauthenticated");
        setUserState("unauthenticated");
        return;
      }

      console.log("Session exists, checking user state...");

      // Check if user exists in profiles table
      const { data: existingUser, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userError || !existingUser) {
        console.log("User not in database - needs onboarding");
        setUserState("needs-onboarding");
        return;
      }

      // Check if user has preferences
      const hasPreferences = await checkUserPreferences();

      if (!hasPreferences) {
        console.log("User has no preferences - needs onboarding");
        setUserState("needs-onboarding");
      } else {
        console.log("User has preferences - fully authenticated");
        setUserState("authenticated");
      }
    };

    determineUserState();
  }, [initialized, session, checkUserPreferences]);

  // Show splash screen while determining user state
  if (!initialized || userState === "loading") {
    return null;
  }

  SplashScreen.hideAsync();

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen 
        name="(public)" 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="(onboarding)" 
        options={{ 
          headerShown: false 
        }}
      />
      <Stack.Screen 
        name="(protected)" 
        options={{ 
          headerShown: false 
        }}
      />
    </Stack>
  );
}