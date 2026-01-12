import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const retro = {
  bg: "bg-[#FFFDF5]",
  card: "bg-white rounded-xl border-2 border-black",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  btnShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  colors: {
    yellow: "#ffd33d",
    teal: "#2EC4B6",
    red: "#ef233c",
    green: "#10b981",
    orange: "#fb923c",
    blue: "#3b82f6",
    purple: "#a855f7",
  },
};

// Reusable Menu Item Component
const MenuItem = ({
  icon,
  label,
  onPress,
  color = "#2EC4B6",
  subtitle,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center ${retro.card} p-4 mb-3`}
    style={retro.btnShadow}
  >
    <View
      className={`w-10 h-10 rounded-lg bg-[${color}] border-2 border-black items-center justify-center mr-4`}
    >
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <View className="flex-1">
      <Text className="text-black font-rubik-bold text-lg">{label}</Text>
      {subtitle && (
        <Text className="text-gray-500 text-xs font-rubik-bold uppercase">
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color="black" />
  </TouchableOpacity>
);

const MoreMenu = () => {
  return (
    <SafeAreaView className={`flex-1 ${retro.bg} px-6`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-20 right-8 w-14 h-14 bg-[#3b82f6] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-48 left-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 right-12 w-12 h-12 bg-[#a855f7] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <Text className="text-3xl font-rubik-bold text-black mt-6 mb-8 uppercase tracking-tight">
        Menu
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <Text className="text-gray-500 font-rubik-bold text-xs uppercase tracking-widest mb-3 ml-1">
          Account
        </Text>
        <MenuItem
          icon="person"
          label="Profile"
          onPress={() => router.push("/profile")}
          color="#2EC4B6"
        />

        {/* Finance Section */}
        <Text className="text-gray-500 font-rubik-bold text-xs uppercase tracking-widest mb-3 mt-4 ml-1">
          Financials
        </Text>

        <MenuItem
          icon="pie-chart"
          label="Insights & Charts"
          subtitle="Coming Soon"
          onPress={() => router.push("/charts")}
          color="#F472B6"
        />

        <MenuItem
          icon="wallet"
          label="Savings Goals"
          onPress={() => router.push("/savings")}
          color="#A855F7"
        />

        <MenuItem
          icon="card"
          label="Loan Calculator"
          subtitle="Coming Soon"
          onPress={() => {}}
          color="#FF9F1C"
        />

        {/* App Section */}
        <Text className="text-gray-500 font-rubik-bold text-xs uppercase tracking-widest mb-3 mt-4 ml-1">
          App
        </Text>
        <MenuItem
          icon="settings"
          label="Settings"
          onPress={() => {}}
          color="#9CA3AF"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreMenu;
