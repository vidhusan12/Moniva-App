import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen() {
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      {/* Background & Atmosphere */}
      <LinearGradient
        colors={["#000000", "#111827", "#000000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute w-full h-full"
      />
      <View className="absolute -top-20 -right-20 w-80 h-80 bg-teal-500/10 rounded-full blur-[80px]" />
      <View className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[80px]" />

      <SafeAreaView className="flex-1 justify-between px-6 pb-12">
        {/* TOP: Ultra-Minimal Header */}
        {/* Changed justify-between to justify-end since we removed the left title */}
        <View className="mt-8 flex-row justify-end items-center">
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="bg-white/5 px-4 py-2 rounded-full border border-white/10"
          >
            <Text className="text-white font-rubik-medium text-xs tracking-widest uppercase">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* CENTER: The Stacked Logo */}
        <View className="flex-1 justify-center items-center">
          {/* 1. MON (The Base) */}
          <Text className="text-[120px] font-rubik-bold text-[#1f2937] leading-none text-center tracking-tighter">
            MON
          </Text>

          {/* 2. IVA (The Light) */}
          {/* Added -mt-4 to pull it up visually closer to MON */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.7}
            className="-mt-4"
          >
            <Animated.View style={{ opacity: opacityAnim }}>
              <Text className="text-[120px] font-rubik-bold text-teal-500 leading-none text-center shadow-lg shadow-teal-500/50 tracking-tighter">
                IVA
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <Text className="text-gray-500 mt-10 text-center font-rubik-medium tracking-[6px] text-xs uppercase opacity-60">
            Tap the light to enter
          </Text>
        </View>

        {/* BOTTOM: Value Prop */}
        <View>
          <Text className="text-white text-3xl font-rubik-light text-center leading-tight">
            See it all.
          </Text>
          <Text className="text-gray-400 text-3xl font-rubik-medium text-center leading-tight">
            Save it all.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
