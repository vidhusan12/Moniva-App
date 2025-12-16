import { addBill, fetchBillById, updateBill } from "@/services/bill";
import { formatDateForMongo } from "@/utils/mongoDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
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
  // Note: Should probably be named NewBillScreen or similar
  const params = useLocalSearchParams();
  const billId = params.id as string | undefined;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  // startDate state was unused and is removed for cleanup
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  useEffect(() => {
    if (billId) {
      setIsLoading(true);
      const loadBill = async () => { 
        try {
          const bill = await fetchBillById(billId);

          if (bill) {
            setAmount(bill.amount.toFixed(2));
            setDescription(bill.description);
            setFrequency(bill.frequency);

            // Set Date Picker to the current next due date (startDate)
            const existingDate = bill.startDate
              ? new Date(bill.startDate)
              : new Date();

            setNextPayDate(existingDate);
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load bill details for editing.");
          router.replace("/bill");
        } finally {
          setIsLoading(false);
        }
      };
      loadBill();
    }
  }, [billId]);

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

    // Convert nextPayDate to ISO string (YYYY-MM-DDTHH:mm:ss.sssZ) for storage
    const formattedDate = formatDateForMongo(nextPayDate);

    const payload = {
      amount: parsedAmount,
      description: description.trim(),
      frequency: frequency,
      startDate: formattedDate,
      originalDueDate: formattedDate, // Set original due date same as start date
    };

    try {
      if (billId) {
        // When updating, clear lastPaidDate using "" to ensure the bill
        // is re-evaluated by the display logic and utility functions.
        const updatePayload = {
          ...payload,
          // CRITICAL FIX: Use "" instead of null for clearing the date status
          lastPaidDate: "",
        };

        await updateBill(billId, updatePayload);
        Alert.alert("Success", "Bill updated!");
      } else {
        // When adding a new bill, lastPaidDate is naturally absent/cleared.
        await addBill(payload);
        Alert.alert("Success", "Bill added!");
        setAmount("");
        setDescription("");
        setFrequency("");
        setNextPayDate(new Date());
      }

      router.replace("/bill");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    // 1. On Android, close the picker immediately after the user makes a selection
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    // 2. If the user successfully picked a date (not just dismissed the picker)
    if (event.type === "set" && selectedDate) {
      setNextPayDate(selectedDate);
    }

    if (Platform.OS === "ios" && selectedDate) {
      // For iOS, the picker stays open, so we update the date dynamically
      setNextPayDate(selectedDate);
    }

    if (event.type === "dismissed" && Platform.OS === "ios") {
      setShowDatePicker(false);
    }
  };

  // Function to format the Date object for display (same as before)
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.replace("/bill")}
          className="p-2 ml-2"
        >
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        {/* Header */}
        <View className="px-5 pt-3 items-start">
          <Text className="text-xl font-rubik-semibold">
            {billId ? "Edit Bill" : "Add Bill"}
          </Text>
          <Text className="text-xs font-rubik-light text-gray-700 mb-2">
            Add your bill and how often you receive it
          </Text>
        </View>

        {/* Description Box */}
        <View className="px-5 mt-2">
          <Text className="text-sm font-rubik text-black-300 mb-1">
            Description
          </Text>
          <View className="bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3">
            <TextInput
              className="text-base font-rubik"
              placeholder="e.g. Netflix, Prime"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
              style={{ minHeight: 20 }}
            />
          </View>

          {/* Amount Box */}
          <Text className="text-sm font-rubik text-black-300 mb-1 mt-3">
            Amount
          </Text>
          <View className="bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3">
            <TextInput
              className="text-base font-rubik"
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#999"
              style={{ minHeight: 20 }}
            />
          </View>

          {/* Frequency Box */}
          <Text className="text-sm font-rubik text-black-300 mb-1 mt-3">
            Frequency
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setFrequency(option)}
                className={`w-[48%] bg-white rounded-xl shadow-md shadow-black/10 p-3 mb-2 items-center ${
                  frequency === option ? "border-2 border-blue-500" : ""
                }`}
              >
                <Text
                  className={`text-sm font-rubik ${
                    frequency === option
                      ? "text-blue-500 font-rubik-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Date Box */}
          <Text className="text-sm font-rubik text-black-300 mb-1 mt-3">
            Bill Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3 flex-row items-center justify-between"
          >
            <Text className="text-base font-rubik text-gray-700">
              {nextPayDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={nextPayDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={onChangeDate}
            />
          )}

          {/* Buttons */}
          <View className="flex-row justify-between mt-6 mb-4 gap-3">
            <TouchableOpacity
              onPress={() => router.replace("/bill")}
              className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-rubik-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-rubik-medium text-white">
                {isLoading ? "Saving..." : billId ? "Update" : "Add Bill"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
