import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { Income } from "@/types/database";
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

const IncomeDetails = () => {
  const params = useLocalSearchParams();
  const incomeId = params.id as string | undefined;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Used only for initial fetch

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  // Store Selectors
  const optimisticallyAddIncome = useFinanceStore(
    (state) => state.optimisticallyAddIncome
  );
  const optimisticallyRemoveIncome = useFinanceStore(
    (state) => state.optimisticallyRemoveIncome
  );
  const refetchIncomes = useFinanceStore((state) => state.refetchIncomes);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || nextPayDate;
    setShowDatePicker(Platform.OS === "ios");
    setNextPayDate(currentDate);
  };

  useEffect(() => {
    if (incomeId) {
      setIsLoading(true);
      const loadIncome = async () => {
        try {
          const user = auth.currentUser;

          if (!user) {
            console.error("No authenticated user found");
            return;
          }

          // The Robust Fetch: Use <Income> to label the incoming data
          const income = await FinanceService.getItemById<Income>(
            "incomes",
            user.uid,
            incomeId
          );

          if (income) {
            setAmount(income.amount.toFixed(2));
            setDescription(income.description);
            setFrequency(income.frequency);

            if (income.date) {
              setNextPayDate(new Date(income.date));
            }
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load income details for editing");
          router.replace("/income");
        } finally {
          setIsLoading(false);
        }
      };
      loadIncome();
    }
  }, [incomeId]);

  
  async function handleSubmit() {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save data.");
      return;
    }

    // 1. Validation (remains the same)
    if (!amount || !description || !frequency || !nextPayDate) {
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
    const incomeData = {
      description: description,
      amount: numericAmount,
      frequency: frequency,
      startDate: nextPayDate.toISOString(),
      date: nextPayDate.toISOString(),
      userId: user.uid,
    };

    // --- START LOGIC SPLIT: EDIT vs ADD ---
    if (incomeId) {
      // --- Edit/Update Mode: Standard (Pessimistic) Approach ---
      try {
        await FinanceService.updateItem(
          "incomes",
          user.uid,
          incomeId,
          incomeData
        );
        //  Refetch after successful update
        await refetchIncomes();
        router.replace("/income");
      } catch (error) {
        console.error("Failed to update income:", error);
        Alert.alert("Error", "Failed to update income. Please try again.");
      }
    } else {
      // --- Add Mode: OPTIMISTIC Approach ---

      // 1. Add the income to the local store INSTANTLY.
      // We create a temporary ID to track this item.
      const tempIncome: Income = { ...incomeData, id: `temp-${Date.now()}` };
      optimisticallyAddIncome(tempIncome);

      // 2. Navigate away INSTANTLY (UX Win)
      router.replace("/income");

      // 3. Start the API call in the background
      try {
        await FinanceService.addItem("incomes", user.uid, incomeData);

        // 4. CONFIRMATION: Refetch all data to replace the temporary ID with the real database ID
        await refetchIncomes();
      } catch (error) {
        // 5. ROLLBACK: If the API failed in the background
        console.error("Failed to save income:", error);

        // Rollback the optimistic change (remove the temporary item)
        optimisticallyRemoveIncome(tempIncome.id!);

        // Optional: Re-fetch the clean list from the server
        // await refetchIncomes();

        Alert.alert("Error", "Failed to save income. Check your connection.", [
          {
            text: "Try Again",
            onPress: () => {
              router.push({
                pathname: "/newIncome",
                params: {
                  description: incomeData.description,
                  amount: incomeData.amount.toString(),
                  frequency: incomeData.frequency,
                  date: incomeData.date,
                },
              });
            },
          },
          {
            text: "Ok",
            style: "cancel",
          },
        ]);
      }
    }
  }

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
          onPress={() => router.replace("/income")}
          className="p-3 ml-2"
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>
        {/* Header */}
        <View className="px-5 pt-2 items-start">
          <Text className="text-2xl font-rubik-semibold text-white">
            {incomeId ? "Edit Income" : "Add Income"}
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400 mb-3">
            Add your income details
          </Text>
        </View>
        {/* Description box */}
        <View className="px-5 mt-2">
          <Text className="text-base font-rubik text-gray-300 mb-2">
            Description
          </Text>
          <View className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="e.g. Salary, Side Hustle"
              value={description}
              onChangeText={setDescription}
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
          {/* Frequency Box */}
          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Frequency
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {frequencyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setFrequency(option)}
                className={`w-[48%] bg-[#1a1a1a] rounded-xl shadow-md shadow-black/50 p-3 mb-2 items-center ${
                  frequency === option ? "border-2 border-blue-500" : ""
                }`}
              >
                <Text
                  className={`text-sm font-rubik mt-1 ${
                    frequency === option
                      ? "text-blue-500 font-rubik-semibold"
                      : "text-gray-300"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Next Pay Date Box */}
          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Next Pay Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base font-rubik text-white">
              {nextPayDate.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#999" />
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
          <View className="flex-row justify-between mt-8 mb-4 gap-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-1 bg-[#2a2a2a] rounded-xl py-4 items-center"
            >
              <Text className="text-base font-rubik-medium text-gray-300">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className="flex-1 bg-blue-500 rounded-xl py-4 items-center"
            >
              <Text className="text-base font-rubik-medium text-white">
                {incomeId ? "Update Income" : "Add Income"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomeDetails;
