// Import gesture handler FIRST before any other imports
import "react-native-gesture-handler";

// The Root Layout
import { auth } from "@/config/firebase";
import { useFinanceStore } from "@/store/financeStore";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
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

  const [fontsLoaded] = useFonts({
    "Rubik-Regular": require("../assets/fonts/Rubik-Regular.ttf"),
    "Rubik-Bold": require("../assets/fonts/Rubik-Bold.ttf"),
    "Rubik-ExtraBold": require("../assets/fonts/Rubik-ExtraBold.ttf"),
    "Rubik-Medium": require("../assets/fonts/Rubik-Medium.ttf"),
    "Rubik-SemiBold": require("../assets/fonts/Rubik-SemiBold.ttf"),
    "Rubik-Light": require("../assets/fonts/Rubik-Light.ttf"),
  });

  // 1. Listen to auth changes - ONLY update state, don't navigate
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(
        "Auth state changed, user:",
        firebaseUser ? firebaseUser.uid : "null"
      );

      if (firebaseUser) {
        console.log("User found, loading initial data...");
        await loadInitialData();
        console.log("Initial data loaded");
      }

      setUser(firebaseUser);
      setIsAuthReady(true);
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Handle navigation based on auth state - runs AFTER auth is ready
  useEffect(() => {
    if (!isAuthReady || !fontsLoaded) return;

    if (user) {
      console.log("Navigating to (tabs)");
      router.replace("/(tabs)");
    } else {
      console.log("Navigating to login");
      router.replace("/(auth)/login");
    }
  }, [user, isAuthReady, fontsLoaded]);

  useEffect(() => {
    console.log(`Fonts loaded: ${fontsLoaded}, Auth ready: ${isAuthReady}`);
    // Only hide the splash once fonts are ready AND auth is determined
    if (fontsLoaded && isAuthReady) {
      console.log("Hiding splash screen");
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isAuthReady]);

  // If everything is still loading, show a dark background with a spinner
  // instead of a blank white screen.
  if (!fontsLoaded || !isAuthReady) {
    // For debugging, you can log the state here
    // console.log(`Waiting: Fonts loaded: ${fontsLoaded}, Auth ready: ${isAuthReady}`);
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#4895ef" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false, animation: "none" }} />
      </UserProvider>
    </GestureHandlerRootView>
  );
}
