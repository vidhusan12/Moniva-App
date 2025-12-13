import { addTransaction } from "@/services/transaction";
import { formatDateForMongo } from "@/utils/mongoDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
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

const newTransaction = () => {
  const params = useLocalSearchParams();
  const transactionId = params.id as string | undefined;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { name: "Food", icon: "fast-food" },
    { name: "Shopping", icon: "cart" },
    { name: "Transport", icon: "car" },
    { name: "Entertainment", icon: "game-controller" },
    { name: "Bills", icon: "receipt" },
    { name: "Health", icon: "medical" },
    { name: "Education", icon: "school" },
    { name: "Travel", icon: "airplane" },
    { name: "Other", icon: "ellipsis-horizontal" },
  ];

  function handleCancel() {
    router.back();
  }

  async function handleAdd() {
    // 1 Check for required fields
    if (!title || !amount || !selectedCategory || !date) {
      Alert.alert("Missing Information", "Please fill in all the information.");
      return;
    }

    // 2. Check if amount is a valid number (and convert it)
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than zero."
      );
      return;
    }

    // 3. Format the data object
    const newTransactionData = {
      description: title,
      amount: numericAmount,
      category: selectedCategory,
      // Convert the Date object to a standardized string for the backend
      date: formatDateForMongo(date),
      // Assuming a user ID might be needed, but we'll keep it simple for now
    };

    //API Call and State Handling
    try {
      setIsLoading(true);
      await addTransaction(newTransactionData);
      Alert.alert("Success", "Transaction added successfully!");
      router.replace("/transaction");
    } catch (error) {
      console.error("Failed to add transaction:", error);
      Alert.alert("Error", "Failed to save transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
          onPress={() => router.replace("/transaction")}
          className="p-2 ml-2"
        >
          <Ionicons name="close" size={28} color="black" />
        </TouchableOpacity>
        {/* Header */}
        <View className="px-5 pt-3 items-start">
          <Text className="text-xl font-rubik-semibold">Add Transaction</Text>
          <Text className="text-xs font-rubik-light text-gray-700 mb-2">
            Add your transaction details
          </Text>
        </View>
        {/* Title box */}
        <View className="px-5 mt-2">
          <Text className="text-sm font-rubik text-black-300 mb-1">Title</Text>
          <View className="bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3">
            <TextInput
              className="text-base font-rubik"
              placeholder="e.g. Food, Shopping"
              value={title}
              onChangeText={setTitle}
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
          {/* Category Box */}
          <Text className="text-sm font-rubik text-black-300 mb-1 mt-3">
            Category
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(category.name)}
                className={`w-[30%] bg-white rounded-xl shadow-md shadow-black/10 p-2 mb-2 items-center ${
                  selectedCategory === category.name
                    ? "border-2 border-blue-500"
                    : ""
                }`}
              >
                <Ionicons
                  name={category.icon as any}
                  size={22}
                  color={
                    selectedCategory === category.name ? "#3b82f6" : "#666"
                  }
                />
                <Text
                  className={`text-xs font-rubik mt-1 ${
                    selectedCategory === category.name
                      ? "text-blue-500 font-rubik-semibold"
                      : "text-gray-700"
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Date Box */}
          <Text className="text-sm font-rubik text-black-300 mb-1 mt-3">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3 flex-row items-center justify-between"
          >
            <Text className="text-base font-rubik text-gray-700">
              {date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#666" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios");
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
          {/* Buttons */}
          <View className="flex-row justify-between mt-6 mb-4 gap-3">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-gray-200 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-rubik-medium text-gray-700">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              disabled={isLoading}
              className="flex-1 bg-blue-500 rounded-xl py-3 items-center"
            >
              <Text className="text-sm font-rubik-medium text-white">
                {isLoading ? "Saving..." : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default newTransaction;
