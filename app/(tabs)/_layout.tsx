import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerShadowVisible: false,
        tabBarShowLabel: false,

        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 2, // Cleaner 2px border
          borderTopColor: "#000000",
          height: Platform.OS === "ios" ? 90 : 70,
          paddingTop: 10,
          elevation: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? "bg-black" : "transparent"}`}>
               <Ionicons name={focused ? "home" : "home-outline"} color={focused ? "#A3E635" : "black"} size={24} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="income"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? "bg-black" : "transparent"}`}>
               <Ionicons name={focused ? "trending-up" : "trending-up-outline"} color={focused ? "#A3E635" : "black"} size={24} />
            </View>
          ),
        }}
      />

      {/* BIG FLOATING ADD BUTTON */}
      <Tabs.Screen
        name="transaction"
        options={{
          tabBarIcon: ({ focused }) => (
            <View 
                className="w-14 h-14 bg-[#A3E635] rounded-full border-2 border-black items-center justify-center -mt-8"
                style={{ shadowColor: "#000", shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0 }}
            >
                <Ionicons name="add" color="black" size={32} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="bill"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? "bg-black" : "transparent"}`}>
               <Ionicons name={focused ? "receipt" : "receipt-outline"} color={focused ? "#A3E635" : "black"} size={24} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="more"
        options={{
          tabBarIcon: ({ focused }) => (
            <View className={`items-center justify-center w-12 h-10 rounded-xl ${focused ? "bg-black" : "transparent"}`}>
               <Ionicons name={focused ? "grid" : "grid-outline"} color={focused ? "#A3E635" : "black"} size={24} />
            </View>
          ),
        }}
      />

      {/* Hidden Routes */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="savings" options={{ href: null }} />
      <Tabs.Screen name="charts" options={{ href: null }} />
    </Tabs>
  );
}