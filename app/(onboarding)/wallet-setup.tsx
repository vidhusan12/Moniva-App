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
      <SafeAreaView className="flex-1 bg-black justify-between px-6">
        <StatusBar style="light" />

        {/* --- HEADER --- */}
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/")
            }
            className="p-2 bg-white/10 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Progress Indicator (Step 1 of 3) */}
          <View className="flex-row space-x-2">
            <View className="w-8 h-1 bg-teal-500 rounded-full" />
            <View className="w-8 h-1 bg-gray-800 rounded-full" />
            <View className="w-8 h-1 bg-gray-800 rounded-full" />
          </View>
        </View>

        {/* --- MAIN INPUT AREA --- */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View>
            <Text className="text-gray-400 font-rubik text-lg mb-4 text-center">
              How much do you have right now?
            </Text>

            <View className="flex-row justify-center items-center">
              <Text className="text-white text-5xl font-rubik-bold mr-2">
                $
              </Text>

              <TextInput
                className="text-white text-5xl font-rubik-bold min-w-[100px] text-center h-16 leading-none"
                placeholder="0"
                placeholderTextColor="#333"
                keyboardType="numeric"
                autoFocus={true}
                value={balance}
                onChangeText={handleChange}
                maxLength={10} // Prevent crazy numbers
              />
            </View>

            <Text className="text-gray-600 text-sm mt-4 text-center">
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
            className={`w-full py-5 rounded-full items-center ${
              balance ? "bg-teal-500" : "bg-gray-800"
            }`}
            disabled={!balance} // Disable if empty
          >
            <Text
              className={`font-rubik-bold text-lg ${
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
