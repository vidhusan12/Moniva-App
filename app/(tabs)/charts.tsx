import React from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";

const Charts = () => {
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a] items-center justify-center">
      <View className="w-20 h-20 bg-[#1a1a1a] rounded-full items-center justify-center mb-6 border border-white/5">
        <Ionicons name="bar-chart" size={32} color="#666" />
      </View>
      <Text className="text-white font-rubik-bold text-2xl">Insights</Text>
      <Text className="text-gray-500 font-rubik text-sm mt-2">
        Detailed graphs coming soon.
      </Text>
    </SafeAreaView>
  );
};

export default Charts;