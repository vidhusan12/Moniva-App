import React from "react";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";

// Reusable Menu Item Component
const MenuItem = ({ icon, label, onPress, color = "#fff", subtitle }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    className="flex-row items-center bg-[#1a1a1a] p-4 rounded-2xl mb-3 border border-white/5"
  >
    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View className="flex-1">
        <Text className="text-white font-rubik-medium text-lg">{label}</Text>
        {subtitle && <Text className="text-gray-500 text-xs font-rubik">{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const MoreMenu = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a] px-6">
      <Text className="text-3xl font-rubik-bold text-white mt-6 mb-8">Menu</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Account Section */}
        <Text className="text-gray-500 font-rubik-medium text-xs uppercase tracking-widest mb-3 ml-1">
          Account
        </Text>
        <MenuItem 
            icon="person" 
            label="Profile" 
            onPress={() => router.push("/profile")} 
            color="#2dd4bf"
        />

        {/* Finance Section */}
        <Text className="text-gray-500 font-rubik-medium text-xs uppercase tracking-widest mb-3 mt-4 ml-1">
          Financials
        </Text>
        
        <MenuItem 
            icon="pie-chart" 
            label="Insights & Charts" 
            subtitle="Coming Soon"
            onPress={() => router.push("/charts")} 
            color="#f472b6"
        />

        <MenuItem 
            icon="wallet" 
            label="Savings Goals" 
            onPress={() => router.push("/savings")} 
            color="#a855f7"
        />
        
        <MenuItem 
            icon="card" 
            label="Loan Calculator" 
            subtitle="Coming Soon"
            onPress={() => {}} 
            color="#f97316"
        />

        {/* App Section */}
        <Text className="text-gray-500 font-rubik-medium text-xs uppercase tracking-widest mb-3 mt-4 ml-1">
          App
        </Text>
        <MenuItem 
            icon="settings" 
            label="Settings" 
            onPress={() => {}} 
            color="#9ca3af"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreMenu;