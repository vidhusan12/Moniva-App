import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../context/UserContext";

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

export default function WalletSetup() {
  const { balance, setBalance } = useUser();

  // Logic: Format the input as currency (e.g., 1000 -> 1,000)
  const handleChange = (text: string) => {
    // 1. Allow numbers AND dots (Changed regex to include \.)
    let cleaned = text.replace(/[^0-9.]/g, "");

    // 2. Safety: Prevent multiple dots (e.g., "1.2.3")
    const dots = cleaned.split(".").length - 1;
    if (dots > 1) {
      // If they type a second dot, ignore the new input
      return;
    }

    // 3. Handle formatting logic
    if (cleaned.endsWith(".")) {
      // If they just typed "100.", keep the dot there!
      setBalance(cleaned);
    } else if (cleaned.includes(".")) {
      // If they are typing decimals (e.g., "100.5")
      const [integer, decimal] = cleaned.split(".");
      // Only format the integer part with commas
      setBalance(`${Number(integer).toLocaleString()}.${decimal}`);
    } else {
      // Normal integer typing (e.g., "100")
      setBalance(cleaned === "" ? "" : Number(cleaned).toLocaleString());
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-32 right-8 w-14 h-14 bg-[#ffd33d] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-64 left-8 w-10 h-10 bg-[#3b82f6] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-48 right-12 w-12 h-12 bg-[#10b981] rounded-lg border-2 border-black opacity-15"
          style={retro.btnShadow}
        />

        <StatusBar style="dark" />

        {/* --- HEADER --- */}
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
            className="p-2 bg-[#ffd33d] rounded-full border-2 border-black"
            style={retro.btnShadow}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>

          {/* Progress Indicator (Step 1 of 3) */}
          <View className="flex-row space-x-2">
            <View className="w-8 h-1 bg-[#2EC4B6] rounded-full border border-black" />
            <View className="w-8 h-1 bg-gray-300 rounded-full border border-black" />
            <View className="w-8 h-1 bg-gray-300 rounded-full border border-black" />
          </View>
        </View>

        {/* --- MAIN INPUT AREA --- */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View>
            <Text className="text-gray-500 font-rubik-bold text-lg mb-4 text-center uppercase">
              How much do you have right now?
            </Text>

            <View className="flex-row justify-center items-center">
              <Text className="text-black text-5xl font-rubik-bold mr-2">
                $
              </Text>

              <TextInput
                className="text-black text-5xl font-rubik-bold min-w-[100px] text-center h-16 leading-none"
                placeholder="0"
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                autoFocus={true}
                value={balance}
                onChangeText={handleChange}
                maxLength={10} // Prevent crazy numbers
              />
            </View>

            <Text className="text-gray-500 text-sm mt-4 text-center font-rubik-bold">
              Include cash, bank accounts, and savings.
            </Text>
          </View>
        </KeyboardAvoidingView>

        {/* --- FOOTER / CONTINUE --- */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={() => {
              // Logic: Navigate to Income Setup
              // In the future, we will SAVE this data here
              router.push("/(onboarding)/income-setup");
            }}
            className={`w-full py-5 rounded-xl items-center border-2 border-black ${
              balance ? "bg-[#2EC4B6]" : "bg-gray-300"
            }`}
            style={balance ? retro.btnShadow : undefined}
            disabled={!balance} // Disable if empty
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-tight ${
                balance ? "text-white" : "text-gray-500"
              }`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
