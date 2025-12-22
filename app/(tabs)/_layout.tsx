import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2dd4bf",
        tabBarInactiveTintColor: "#666666",
        headerShadowVisible: false,
        
        // --- TAB BAR CONTAINER STYLE ---
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopWidth: 0, // Removed border for a cleaner floating look
          
          // Increased height to fix your "too close to bottom" issue
          height: Platform.OS === "ios" ? 100 : 80,
          
          // Added more padding to push icons up from the bottom edge
          paddingBottom: Platform.OS === "ios" ? 40 : 20,
          paddingTop: 10,
          
          elevation: 0, // No shadow on Android
          position: "absolute", // Makes background transparent at corners if needed
          bottom: 0,
        },
        
        tabBarLabelStyle: {
          fontFamily: "Rubik-Medium",
          fontSize: 10,
        },
      }}
    >
      {/* 1. HOME (Left Small) */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home-outline"} color={color} size={24} />
          ),
        }}
      />

      {/* 2. INCOME (Left Small) */}
      <Tabs.Screen
        name="income"
        options={{
          title: "Income",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "trending-up" : "trending-up-outline"} color={color} size={24} />
          ),
        }}
      />

      {/* 3. TRANSACTION (The BIG Center Button) */}
      <Tabs.Screen
        name="transaction"
        options={{
          title: "", // No text label for the big button
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                top: -20, // Moves it UP out of the bar
                width: 60,
                height: 60,
                borderRadius: 30, // Makes it a perfect circle
                backgroundColor: "#2dd4bf", // Teal background
                justifyContent: "center",
                alignItems: "center",
                // Shadow for 3D effect
                shadowColor: "#2dd4bf",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 5,
              }}
            >
              <Ionicons 
                name="swap-horizontal" 
                color="white" // White icon on Teal background
                size={30} 
              />
            </View>
          ),
        }}
      />

      {/* 4. BILLS (Right Small) */}
      <Tabs.Screen
        name="bill"
        options={{
          title: "Bills",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "receipt" : "receipt-outline"} color={color} size={24} />
          ),
        }}
      />

      {/* 5. MORE (Right Small) */}
      <Tabs.Screen
        name="more"
        options={{
          title: "More",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "grid" : "grid-outline"} color={color} size={24} />
          ),
        }}
      />

      {/* --- HIDDEN ROUTES --- */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="savings" options={{ href: null }} />
      <Tabs.Screen name="charts" options={{ href: null }} />
    </Tabs>
  );
}