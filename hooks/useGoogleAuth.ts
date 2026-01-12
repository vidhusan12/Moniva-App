import { ResponseType } from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef } from "react";
import { Keyboard, Platform } from "react-native";
import { auth, db } from "../config/firebase";

// Complete the auth session properly
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const isAuthInProgress = useRef(false);

  const config = useMemo(
    () => ({
      // Using Web Client ID for iOS since it has redirect URI configured
      iosClientId:
        "990486735182-s8kkpa4tfu2ul32tg0m37cvb8vmb0uhl.apps.googleusercontent.com",
      androidClientId:
        "990486735182-hkf5bqa1ladoo6pnusrdvohfqqujkldg.apps.googleusercontent.com",
      // Keep the web client ID - it's needed for the backend
      webClientId:
        "990486735182-s8kkpa4tfu2ul32tg0m37cvb8vmb0uhl.apps.googleusercontent.com",

      // Explicitly set redirect URI to Expo's auth proxy
      redirectUri: "https://auth.expo.io/@vidhusan/Moniva-App",

      // Use id_token response type instead of code
      responseType: ResponseType.IdToken,
    }),
    []
  );

  const [request, response, promptAsync] = Google.useAuthRequest(config);

  useEffect(() => {
    if (!response) return;
    console.log("🔍 Response changed! Type:", response?.type);
    console.log("🔍 Full Response:", JSON.stringify(response, null, 2));

    if (response?.type === "success") {
      console.log("✅ Success! Params:", response.params);

      // Check if we have an id_token or authentication code
      const { id_token } = response.params;
      const authentication = response.authentication;

      if (id_token) {
        console.log("Using id_token");
        const credential = GoogleAuthProvider.credential(id_token);
        handleGoogleLogin(credential);
      } else if (authentication?.idToken) {
        console.log("Using authentication.idToken");
        const credential = GoogleAuthProvider.credential(
          authentication.idToken
        );
        handleGoogleLogin(credential);
      } else {
        console.error("❌ No id_token found in response:", response.params);
      }
    } else if (response?.type === "error") {
      console.error("❌ Google Auth Error:", response.error);
      console.error("❌ Error details:", JSON.stringify(response, null, 2));
      isAuthInProgress.current = false;
    } else if (response?.type === "dismiss" || response?.type === "cancel") {
      console.log("⚠️ User cancelled or dismissed auth");
      isAuthInProgress.current = false;
    } else if (response?.type === "locked") {
      console.log("⚠️ Auth already in progress");
      isAuthInProgress.current = false;
    }
  }, [response]);

  const handleGoogleLogin = async (credential: any) => {
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        if (userDoc.data()?.isOnboardingComplete) {
          router.replace("/(tabs)");
        } else {
          router.replace("/(onboarding)/wallet-setup");
        }
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          uid: user.uid,
          createdAt: new Date(),
          isOnboardingComplete: false,
        });
        router.replace("/(onboarding)/wallet-setup");
      }
    } catch (err) {
      console.error("Login Error:", err);
    }
  };

  return {
    promptAsync: async () => {
      if (isAuthInProgress.current) {
        console.log("⚠️ Auth already in progress, ignoring...");
        return;
      }

      // Dismiss keyboard before opening browser to prevent UI issues
      Keyboard.dismiss();

      console.log("🚀 promptAsync called - opening Google sign in...");
      isAuthInProgress.current = true;

      try {
        // Small delay to let keyboard dismissal complete
        await new Promise((resolve) => setTimeout(resolve, 200));

        const result = await promptAsync({
          // Use show page on iOS to prevent white screen
          ...(Platform.OS === "ios" && {
            showInRecents: false,
          }),
        });
        console.log("🎯 promptAsync result:", result);

        if (result.type !== "success") {
          isAuthInProgress.current = false;
        }

        return result;
      } catch (error) {
        console.error("💥 promptAsync error:", error);
        isAuthInProgress.current = false;
        throw error;
      }
    },
  };
};
