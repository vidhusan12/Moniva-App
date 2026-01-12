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
  Modal,
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
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-32 left-8 w-14 h-14 bg-[#10b981] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-64 right-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-48 left-12 w-12 h-12 bg-[#3b82f6] rounded-lg border-2 border-black opacity-15"
          style={retro.btnShadow}
        />

        <StatusBar style="dark" />

        {/* --- HEADER --- */}
        <View className="mt-4 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() =>
              router.canGoBack()
                ? router.back()
                : router.replace("/(onboarding)")
            }
            className="p-2 bg-[#ffd33d] rounded-lg border-2 border-black"
            style={retro.btnShadow}
          >
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <View className="flex-row space-x-2">
            <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
            <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
            <View className="w-8 h-1 bg-gray-300 rounded-lg border border-black" />
          </View>
        </View>

        {/* --- MAIN CONTENT --- */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View>
            <Text className="text-gray-500 font-rubik-bold text-base mb-2 text-center uppercase tracking-tight">
              What is your main source of income?
            </Text>

            {/* 0. DESCRIPTION INPUT (NEW) */}
            <View
              className="mb-6 bg-white rounded-xl px-4 py-4 border-2 border-black"
              style={retro.shadow}
            >
              <TextInput
                className="text-black font-rubik-medium text-lg text-center py-1"
                placeholder="e.g. Work, Salary"
                placeholderTextColor="#999"
                value={incomeDescription}
                onChangeText={setIncomeDescription}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {/* 1. AMOUNT INPUT */}
            <View className="flex-row justify-center items-center mb-6">
              <Text className="text-[#2EC4B6] text-5xl font-rubik-bold mr-2">
                $
              </Text>
              <TextInput
                className="text-black text-5xl font-rubik-bold min-w-[100px] text-center h-16 leading-none py-1"
                placeholder="0"
                placeholderTextColor="#ccc"
                keyboardType="decimal-pad"
                value={incomeAmount}
                onChangeText={handleAmountChange}
                maxLength={10}
                returnKeyType="done"
              />
            </View>

            {/* 2. FREQUENCY SELECTOR */}
            <Text className="text-gray-500 text-xs font-rubik-bold uppercase tracking-widest text-center mb-3">
              How often?
            </Text>
            <View className="flex-row justify-center space-x-3 mb-8">
              {FREQUENCIES.map((freq) => (
                <TouchableOpacity
                  key={freq}
                  onPress={() => setIncomeFrequency(freq)}
                  className={`px-4 py-3 rounded-xl border-2 ${
                    incomeFrequency === freq
                      ? "bg-[#A3E635] border-black"
                      : "bg-white border-black"
                  }`}
                  style={incomeFrequency === freq ? retro.btnShadow : undefined}
                >
                  <Text
                    className={`font-rubik-bold text-sm ${incomeFrequency === freq ? "text-black" : "text-gray-600"}`}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 3. NEXT PAY DATE */}
            <Text className="text-gray-500 text-xs font-rubik-bold uppercase tracking-widest text-center mb-3">
              Next Pay Date?
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-white rounded-xl py-4 flex-row justify-center items-center border-2 border-black mx-8"
              style={retro.shadow}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color="#2EC4B6"
                style={{ marginRight: 10 }}
              />
              <Text className="text-black font-rubik-bold text-lg">
                {nextPayDate.toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* iOS Date Picker Modal */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View className="flex-1 bg-black/50 justify-center items-center">
                <TouchableWithoutFeedback>
                  <View
                    className="bg-white mx-6 p-4 rounded-2xl border-2 border-black"
                    style={retro.shadow}
                  >
                    <Text className="text-black font-rubik-bold text-center mb-4 uppercase tracking-tight">
                      Select Pay Date
                    </Text>
                    <DateTimePicker
                      value={nextPayDate}
                      mode="date"
                      display="inline"
                      onChange={onDateChange}
                      themeVariant="light"
                      accentColor="#2EC4B6"
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-[#2EC4B6] py-3 rounded-xl items-center border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Text className="text-white font-rubik-bold uppercase tracking-tight">
                        Done
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        )}
        {showDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={nextPayDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* --- FOOTER --- */}
        <View className="mb-4">
          <TouchableOpacity
            // 👇 UPDATED: Now goes to Bill Setup
            onPress={() => router.push("/(onboarding)/bill-setup")}
            className={`w-full py-5 rounded-xl items-center border-2 border-black ${
              incomeAmount && incomeDescription ? "bg-[#2EC4B6]" : "bg-gray-300"
            }`}
            style={
              incomeAmount && incomeDescription ? retro.btnShadow : undefined
            }
            disabled={!incomeAmount || !incomeDescription}
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-tight ${incomeAmount && incomeDescription ? "text-white" : "text-gray-500"}`}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}
