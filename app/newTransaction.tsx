import {
  addTransaction,
  fetchTransactionById,
  // 🏆 IMPORTANT: Import the Transaction type from your service file
  Transaction,
  updateTransaction,
} from "@/services/transaction";
import { formatDateForMongo } from "@/utils/mongoDate";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
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
// 🏆 CORRECT IMPORT: We need the store
import { useFinanceStore } from "@/store/financeStore";

const newTransaction = () => {
  const params = useLocalSearchParams();
  const transactionId = params.id as string | undefined;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🏆 INFINITE LOOP FIX: Select actions individually (most robust method)
  const optimisticallyAddTransaction = useFinanceStore(
    (state) => state.optimisticallyAddTransaction
  );
  const optimisticallyRemoveTransaction = useFinanceStore(
    (state) => state.optimisticallyRemoveTransaction
  );
  const refetchTransactions = useFinanceStore(
    (state) => state.refetchTransactions
  );

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

  useEffect(() => {
    if (transactionId) {
      setIsLoading(true);
      const loadTransaction = async () => {
        try {
          const transaction = await fetchTransactionById(transactionId);

          if (transaction) {
            setTitle(transaction.description);
            setAmount(transaction.amount.toFixed(2));
            setSelectedCategory(transaction.category);

            if (transaction.date) {
              setDate(new Date(transaction.date));
            }
          }
        } catch (error) {
          Alert.alert(
            "Error",
            "Failed to load transaction details for editing"
          );
          router.replace("/transaction");
        } finally {
          setIsLoading(false);
        }
      };
      loadTransaction();
    }
  }, [transactionId]);

  function handleCancel() {
    router.back();
  }

  // REFACTORED: The Optimistic Update Logic
  async function handleAdd() {
    // 1. Validation (remains the same)
    if (!title || !amount || !selectedCategory || !date) {
      Alert.alert("Missing Information", "Please fill in all the information.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert(
        "Invalid Amount",
        "Please enter a valid amount greater than zero."
      );
      return;
    }

    // 2. Prepare Data Object
    const newTransactionData: Transaction = {
      description: title,
      amount: numericAmount,
      category: selectedCategory,
      date: formatDateForMongo(new Date()),
    };

    // --- START LOGIC SPLIT: EDIT vs ADD ---

    if (transactionId) {
      // --- Edit/Update Mode: Standard (Pessimistic) Approach ---
      try {
        await updateTransaction(transactionId, newTransactionData);
        await refetchTransactions();
        router.replace("/transaction");
      } catch (error) {
        console.error("Failed to update transaction:", error);
        Alert.alert("Error", "Failed to update transaction. Please try again.");
      }
    } else {
      // --- Add Mode: OPTIMISTIC Approach ---

      // 1. Add the transaction to the local store INSTANTLY.
      const tempTransaction: Transaction = {
        ...newTransactionData,
        _id: `temp-${Date.now()}`,
      };
      optimisticallyAddTransaction(tempTransaction);

      // 2. Navigate away INSTANTLY (UX Win)
      router.replace("/transaction");

      // 3. Start API call in the background
      try {
        await addTransaction(newTransactionData);

        // 4. CONFIRMATION: Refetch all data to replace the temporary ID with the real database ID
        await refetchTransactions();
      } catch (error) {
        // 5. ROLLBACK: If the API failed
        console.error("Failed to save transaction:", error);

        // Rollback the optimistic change (remove the temporary item)
        optimisticallyRemoveTransaction(tempTransaction._id!);

        Alert.alert(
          "Error",
          "Failed to save transaction. Check your connection."
        );
      }
    }
  }

  // --- JSX Rendering ---
  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Back Button */}
        <TouchableOpacity
          onPress={() => router.replace("/transaction")}
          className="p-3 ml-2"
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
        {/* Header */}
        <View className="px-5 pt-2 items-start">
          <Text className="text-2xl font-rubik-semibold text-white">
            {transactionId ? "Edit Transaction" : "Add Transaction"}
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400 mb-3">
            Add your transaction details
          </Text>
        </View>
        {/* Title box */}
        <View className="px-5 mt-2">
          <Text className="text-base font-rubik text-gray-300 mb-2">Title</Text>
          <View className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="e.g. Food, Shopping"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor="#999"
              style={{ minHeight: 20 }}
            />
          </View>
          {/* Amount Box */}
          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Amount
          </Text>
          <View className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="Enter Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#999"
              style={{ minHeight: 20 }}
            />
          </View>
          {/* Category Box */}
          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Category
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedCategory(category.name)}
                className={`w-[30%] bg-[#1a1a1a] rounded-xl shadow-md shadow-black/50 p-2 mb-2 items-center ${
                  selectedCategory === category.name
                    ? "border-2 border-blue-500"
                    : ""
                }`}
              >
                <Ionicons
                  name={category.icon as any}
                  size={22}
                  color={
                    selectedCategory === category.name ? "#3b82f6" : "#999"
                  }
                />
                <Text
                  className={`text-xs font-rubik mt-1 ${
                    selectedCategory === category.name
                      ? "text-blue-500 font-rubik-semibold"
                      : "text-gray-300"
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Date Box */}
          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base font-rubik text-white">
              {date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#999" />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                setShowDatePicker(Platform.OS === "ios" ? false : false);
                if (selectedDate) {
                  setDate(selectedDate);
                }
              }}
            />
          )}
          {/* Buttons */}
          <View className="flex-row justify-between mt-8 mb-4 gap-4">
            <TouchableOpacity
              onPress={handleCancel}
              className="flex-1 bg-[#2a2a2a] rounded-xl py-4 items-center"
            >
              <Text className="text-base font-rubik-medium text-gray-300">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleAdd}
              className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
            >
              <Text className="text-base font-rubik-medium text-white">
                {transactionId ? "Update Transaction" : "Add Transaction"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default newTransaction;
