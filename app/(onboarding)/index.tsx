import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const retro = {
  bg: "bg-[#FFFDF5]",
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

export default function WelcomeScreen() {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-32 right-8 w-16 h-16 bg-[#ffd33d] rounded-full border-2 border-black opacity-20"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-64 left-8 w-12 h-12 bg-[#10b981] rounded-xl border-2 border-black opacity-20 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-48 right-12 w-14 h-14 bg-[#a855f7] rounded-lg border-2 border-black opacity-20"
        style={retro.btnShadow}
      />

      <StatusBar style="dark" />

      <SafeAreaView className="flex-1 justify-between px-6 pb-12">
        {/* TOP: Sign In Button */}
        <View className="mt-8 flex-row justify-end items-center">
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="bg-[#3b82f6] px-6 py-3 rounded-xl border-2 border-black"
            style={retro.btnShadow}
          >
            <Text className="text-white font-rubik-bold text-xs tracking-widest uppercase">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* CENTER: Retro Logo Stack */}
        <View className="flex-1 justify-center items-center">
          {/* MON (Base Text) */}
          <Text className="text-[120px] font-rubik-bold text-gray-300 leading-none text-center tracking-tighter">
            MON
          </Text>

          {/* IVA (Highlighted with Animation) */}
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            activeOpacity={0.7}
            className="-mt-4"
          >
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }],
              }}
              className="bg-[#10b981] px-8 py-2 rounded-2xl border-4 border-black"
            >
              <Text
                className="text-[120px] font-rubik-bold text-white leading-none text-center tracking-tighter"
                style={{
                  textShadowColor: "#000",
                  textShadowOffset: { width: 4, height: 4 },
                  textShadowRadius: 0,
                }}
              >
                IVA
              </Text>
            </Animated.View>
          </TouchableOpacity>

          <Text className="text-black mt-12 text-center font-rubik-bold tracking-[6px] text-xs uppercase">
            Tap to begin
          </Text>
        </View>

        {/* BOTTOM: Value Prop */}
        <View>
          <Text className="text-black text-4xl font-rubik-bold text-center leading-tight uppercase tracking-tight mb-2">
            See it all.
          </Text>
          <Text className="text-gray-500 text-2xl font-rubik-bold text-center leading-tight uppercase">
            Save it all.
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}
