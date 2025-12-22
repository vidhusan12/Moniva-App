// Import gesture handler FIRST before any other imports
import "react-native-gesture-handler";

// The Root Layout
import { auth, db } from "@/config/firebase"; // 👈 Added db
import { useFinanceStore } from "@/store/financeStore";
import { useFonts } from "expo-font";
import { Stack, router, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; // 👈 Added Firestore tools
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider } from "./context/UserContext";
import "./global.css";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const loadInitialData = useFinanceStore((state) => state.loadInitialData);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const segments = useSegments();
  const navigationAttempted = useRef(false);

  const [fontsLoaded] = useFonts({
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
  });

  // 1. Listen to auth changes - NO NAVIGATION HERE
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("Auth changed:", firebaseUser?.uid);

      if (firebaseUser) {
        await loadInitialData();
      }

      setUser(firebaseUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
  }, []);

  // 2. NAVIGATION GUARD - only navigate ONCE on initial load
  useEffect(() => {
    if (!isAuthReady || !fontsLoaded || navigationAttempted.current) return;

    const checkAndNavigate = async () => {
      if (user) {
        // User is logged in - check onboarding status
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const isOnboardingComplete =
            userDoc.exists() && userDoc.data()?.isOnboardingComplete;

          if (isOnboardingComplete) {
            console.log("Logged in + Onboarding done → Tabs");
            router.replace("/(tabs)");
          } else {
            console.log("Logged in + No onboarding → Wallet Setup");
            router.replace("/(onboarding)/wallet-setup");
          }
        } catch (error) {
          console.error("Error checking onboarding:", error);
          router.replace("/(tabs)");
        }
      } else {
        // User logged out → Welcome Screen
        console.log("No user → Welcome Screen");
        router.replace("/(onboarding)");
      }

      navigationAttempted.current = true;
    };

    checkAndNavigate();
  }, [user, isAuthReady, fontsLoaded]);

  // 3. Hide Splash Screen
  useEffect(() => {
    if (fontsLoaded && isAuthReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthReady]);

  // Loading View
  if (!fontsLoaded || !isAuthReady) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2dd4bf" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
          {/* Auth screens - no layout, declare individually */}
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="(auth)/signup" />

          {/* Onboarding flow - has its own _layout.tsx */}
          <Stack.Screen name="(onboarding)" />

          {/* Main app - has its own _layout.tsx */}
          <Stack.Screen name="(tabs)" />

          {/* Modal/standalone screens */}
          <Stack.Screen name="newBill" />
          <Stack.Screen name="newIncome" />
          <Stack.Screen name="newTransaction" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </UserProvider>
    </GestureHandlerRootView>
  );
}
