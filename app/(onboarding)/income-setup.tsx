import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
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
import { useUser } from "../../app/context/UserContext";

const FREQUENCIES = ["Weekly", "Fortnightly", "Monthly"];

export default function IncomeSetup() {
  const {
    incomeAmount,
    setIncomeAmount,
    incomeFrequency,
    setIncomeFrequency,
    nextPayDate,
    setNextPayDate,
    incomeDescription,
    setIncomeDescription, // <--- Get these from context
  } = useUser();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    const dots = cleaned.split(".").length - 1;
    if (dots > 1) return;

    if (cleaned.endsWith(".")) {
      setIncomeAmount(cleaned);
    } else if (cleaned.includes(".")) {
      const [integer, decimal] = cleaned.split(".");
      setIncomeAmount(`${Number(integer).toLocaleString()}.${decimal}`);
    } else {
      setIncomeAmount(cleaned === "" ? "" : Number(cleaned).toLocaleString());
    }
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setNextPayDate(selectedDate);
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
                : router.replace("/(onboarding)")
            }
            className="p-2 bg-white/10 rounded-full"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row space-x-2">
            <View className="w-8 h-1 bg-teal-500 rounded-full" />
            <View className="w-8 h-1 bg-teal-500 rounded-full" />
            <View className="w-8 h-1 bg-gray-800 rounded-full" />
          </View>
        </View>

        {/* --- MAIN CONTENT --- */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View>
            <Text className="text-gray-400 font-rubik text-lg mb-2 text-center">
              What is your main source of income?
            </Text>

            {/* 0. DESCRIPTION INPUT (NEW) */}
            <View className="mb-6 bg-[#1a1a1a] rounded-xl px-4 py-3 border border-white/10">
              <TextInput
                className="text-white font-rubik-medium text-lg text-center"
                placeholder="e.g. Work, Salary"
                placeholderTextColor="#666"
                value={incomeDescription}
                onChangeText={setIncomeDescription}
              />
            </View>

            {/* 1. AMOUNT INPUT */}
            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-white text-5xl font-rubik-bold mr-2">
                $
              </Text>
              <TextInput
                className="text-white text-5xl font-rubik-bold min-w-[100px] text-center h-16 leading-none"
                placeholder="0"
                placeholderTextColor="#333"
                keyboardType="numeric"
                value={incomeAmount}
                onChangeText={handleAmountChange}
                maxLength={10}
              />
            </View>

            {/* 2. FREQUENCY SELECTOR */}
            <Text className="text-gray-500 text-xs font-rubik uppercase tracking-widest text-center mb-3">
              How often?
            </Text>
            <View className="flex-row justify-center space-x-3 mb-8">
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => setIncomeFrequency(freq)}
                  className={`px-4 py-3 rounded-xl border ${
                    incomeFrequency === freq
                      ? "bg-teal-500/20 border-teal-500"
                      : "bg-[#1a1a1a] border-transparent"
                  }`}
                >
                  <Text
                    className={`font-rubik-medium text-sm ${incomeFrequency === freq ? "text-teal-400" : "text-gray-400"}`}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. NEXT PAY DATE */}
            <Text className="text-gray-500 text-xs font-rubik uppercase tracking-widest text-center mb-3">
              Next Pay Date?
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-[#1a1a1a] rounded-xl py-4 flex-row justify-center items-center border border-white/5 mx-8"
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#2dd4bf"
                style={{ marginRight: 10 }}
              />
              <Text className="text-white font-rubik-medium text-lg">
                {nextPayDate.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </TouchableOpacity>

            {/* Date Picker Modal Logic */}
            {showDatePicker &&
              (Platform.OS === "ios" ? (
                <View className="absolute top-20 bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 self-center z-50 shadow-2xl">
                  <DateTimePicker
                    value={nextPayDate}
                    mode="date"
                    display="inline"
                    onChange={onDateChange}
                    themeVariant="dark"
                    accentColor="#2dd4bf"
                  />
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="mt-2 bg-teal-500 py-2 rounded-lg items-center"
                  >
                    <Text className="text-black font-rubik-bold">Done</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <DateTimePicker
                  value={nextPayDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              ))}
          </View>
        </KeyboardAvoidingView>

        {/* --- FOOTER --- */}
        <View className="mb-4">
          <TouchableOpacity
            // 👇 UPDATED: Now goes to Bill Setup
            onPress={() => router.push("/(onboarding)/bill-setup")}
            className={`w-full py-5 rounded-full items-center ${
              incomeAmount && incomeDescription ? "bg-teal-500" : "bg-gray-800"
            }`}
            disabled={!incomeAmount || !incomeDescription}
          >
            <Text
              className={`font-rubik-bold text-lg ${incomeAmount && incomeDescription ? "text-white" : "text-gray-500"}`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
