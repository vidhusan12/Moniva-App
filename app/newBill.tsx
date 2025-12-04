import { addBilll } from "@/services/bill";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, Stack } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BillDetails = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (
      !parsedAmount ||
      isNaN(parsedAmount) ||
      description.trim() === "" ||
      !frequency
    ) {
      Alert.alert("Error", "Enter amount, description, and select frequency.");
      return;
    }

    try {
      await addBilll({
        amount: parsedAmount,
        description: description.trim(),
        frequency: frequency,
        startDate: nextPayDate.toISOString().split("T")[0],
      });

      Alert.alert("Success", "Bill added!");
      setAmount("");
      setDescription("");
      setFrequency("");
      router.back();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // 1. On Android, close the picker immediately after the user makes a selection
    // The 'default' display style on Android automatically closes when a date is picked.
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    // 2. If the user successfully picked a date (not just dismissed the picker)
    if (event.type === "set" && selectedDate) {
      setNextPayDate(selectedDate);
    }

    if (Platform.OS === "ios" && selectedDate) {
      setNextPayDate(selectedDate);
    }

    if (event.type === "dismissed" && Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  // 5. Function to format the Date object for display (same as before)
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => router.back()} className="p-2 ml-2">
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        {/* Header */}
        <View className="px-5 pt-8 items-start">
          <Text className="text-2xl font-rubik-semibold">New Bill</Text>
          <Text className="text-sm font-rubik-light text-gray-700 mb-4">
            Add your bill and how often you receive it
          </Text>
        </View>

        {/* Bill Amount Card */}
        <View className=" px-5 items-start w-full">
          <View className="w-full max-w-md bg-white rounded-2xl p-5 shadow-md shadow-black/10">
            <Text className="font-rubik pb-4 text-lg tracking-wider">
              Bill amount
            </Text>
            <TextInput
              className="text-3xl font-rubik bg-transparent mb-8"
              placeholder="$0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor="#333"
            />
          </View>
        </View>

        {/* Description label OUTSIDE the box */}
        <View className="items-start w-full px-5 mt-4">
          <Text className="text-lg font-rubik mb-1">Description</Text>
        </View>
        <View className="items-start w-full">
          <View className="w-11/12 max-w-md bg-white rounded-2xl mx-4 shadow-md shadow-black/10 ">
            <TextInput
              placeholder="e.g. Netflix, Prime"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#adb5bd"
              className="text-base font-rubik bg-transparent py-4 px-3 min-h-[48px]"
            />
          </View>
        </View>

        {/* Start Date box */}
        <View className="items-start w-full px-5 mt-4">
          <Text className="text-lg font-rubik mb-1">Bill Date</Text>
        </View>
        <View className="items-start w-full">
          <View className="w-11/12 max-w-md bg-white rounded-2xl mx-4 shadow-md shadow-black/10 ">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="text-base font-rubik bg-transparent py-4 px-3 min-h-[48px] justify-center"
              activeOpacity={0.7}
            >
              <Text>{formatDateForDisplay(nextPayDate)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. Date Picker Component (Conditional Rendering) */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={nextPayDate} // Must be a Date object
            mode="date"
            // 'spinner' is preferred on iOS for cleaner appearance
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}

        {/* Frequency box */}
        <View className="items-start w-full px-5 mt-4">
          <Text className="text-lg font-rubik mb-1">Frequency</Text>
          <View className="flex-row space-x-4">
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setFrequency(option)}
                className={`px-4 py-2 rounded-xl border ${
                  frequency === option
                    ? "bg-[#ffd33d] border-[#ffd33d] text-black font-rubik-semibold"
                    : "bg-white border-gray-300 text-gray-700 font-rubik"
                }`}
              >
                <Text
                  className={`${
                    frequency === option
                      ? "text-black font-rubik-semibold"
                      : "text-gray-700 font-rubik"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ADD & Cancel box */}
        <View className="justify-center items-center gap-4  mt-4">
          <TouchableOpacity
            className="bg-blue-500 px-8 py-3 rounded-lg w-48"
            onPress={handleSubmit}
          >
            <Text className="font-rubik text-lg text-center">Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
