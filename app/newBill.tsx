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
// 🏆 Import the Zustand store
import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { Bill } from "@/types/database";

const BillDetails = () => {
  const params = useLocalSearchParams();
  const billId = params.id as string | undefined;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  // 🏆 STABLE SELECTORS: Prevents infinite loops by selecting actions individually
  const optimisticallyAddBill = useFinanceStore(
    (state) => state.optimisticallyAddBill
  );
  const optimisticallyRemoveBill = useFinanceStore(
    (state) => state.optimisticallyRemoveBill
  );
  const refetchBills = useFinanceStore((state) => state.refetchBills);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || nextPayDate;
    setShowDatePicker(Platform.OS === "ios");
    setNextPayDate(currentDate);
  };

  useEffect(() => {
    if (billId) {
      setIsLoading(true);
      const loadBill = async () => {
        try {
          const user = auth.currentUser;

          // 🛡️ The Guard Clause: Stop if no user is found
          if (!user) {
            console.error("No authenticated user found");
            return;
          }

          // 🏆 The Robust Fetch: Use <Bill> to label the incoming data
          const bill = await FinanceService.getItemById<Bill>(
            "bills",
            user.uid,
            billId
          );

          if (bill) {
            // 🔢 Logic: Format the numeric amount for the text input
            setAmount(bill.amount.toFixed(2));
            setDescription(bill.description);
            setFrequency(bill.frequency);

            if (bill.startDate) {
              setNextPayDate(new Date(bill.startDate));
            }
          }
        } catch (error) {
          Alert.alert("Error", "Failed to load bill details for editing");
          router.replace("/bill");
        } finally {
          setIsLoading(false);
        }
      };
      loadBill();
    }
  }, [billId]);

  async function handleSubmit() {
    // 🛡️ 1. The Gatekeeper: Verify authentication
    // Why: We can't save data if we don't know who the user is.
    // If 'user' is null, accessing 'user.uid' would crash the app.
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You must be logged in to save data.");
      return;
    }

    // 📝 2. Validation: Ensure all fields are filled
    // Why: Empty fields in a database cause errors in your UI later (like "NaN" on the dashboard).
    if (!amount || !description || !frequency || !nextPayDate) {
      Alert.alert("Missing Information", "Please fill in all the information.");
      return;
    }

    // 🔢 3. Conversion: Transform string input to a number
    // Why: TextInputs always return strings. We need a real 'Number' for math later.
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    // 📦 4. Data Preparation: Match your 'Bill' type
    // We use .toISOString() to save the date as a standardized string.
    const billData = {
      description: description,
      amount: numericAmount,
      frequency: frequency,
      startDate: nextPayDate.toISOString(),
      date: nextPayDate.toISOString(),
      status: "unpaid" as const,
      userId: user.uid,
    };

    // --- START LOGIC: EDIT vs ADD ---
    if (billId) {
      // --- Edit Mode ---
      try {
        // We call updateItem with the specific billId
        await FinanceService.updateItem("bills", user.uid, billId, billData);
        await refetchBills();
        router.replace("/bill");
      } catch (error) {
        console.error("Failed to update bill:", error);
        Alert.alert("Error", "Failed to update bill.");
      }
    } else {
      // --- Add Mode: OPTIMISTIC Approach ---

      // A. Create a temporary object for the UI to show immediately
      const tempBill: Bill = { ...billData, id: `temp-${Date.now()}` };
      optimisticallyAddBill(tempBill);

      // B. Navigate away instantly so the user doesn't have to wait for the cloud
      router.replace("/bill");

      // C. Background Task: Save to Firebase
      try {
        // Attempt to save to the cloud
        await FinanceService.addItem("bills", user.uid, billData);

        // Success: Update the store to get the real ID
        await refetchBills();
      } catch (error) {
        // 🚨 ROLLBACK: If the cloud save fails, remove the temp item from the UI
        console.error("Failed to save bill:", error);
        optimisticallyRemoveBill(tempBill.id!);
        Alert.alert(
          "Save Failed",
          "We couldn't reach the cloud. Would you like to try again?",
          [
            {
              text: "Try Again",
              onPress: () => {
                // 🔄 Logic: Push them back to the form with their data intact
                router.push({
                  pathname: "/newBill",
                  params: {
                    description: billData.description,
                    amount: billData.amount.toString(), // Convert number to string for params
                    frequency: billData.frequency,
                    startDate: billData.startDate,
                  },
                });
              },
            },
            {
              text: "OK",
              style: "cancel",
            },
          ]
        );
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity
          onPress={() => router.replace("/bill")}
          className="p-3 ml-2"
        >
          <Ionicons name="close" size={32} color="white" />
        </TouchableOpacity>

        <View className="px-5 pt-2 items-start">
          <Text className="text-2xl font-rubik-semibold text-white">
            {billId ? "Edit Bill" : "Add Bill"}
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400 mb-3">
            Add your bill details
          </Text>
        </View>

        <View className="px-5 mt-2">
          <Text className="text-base font-rubik text-gray-300 mb-2">
            Description
          </Text>
          <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="e.g. Rent, Subscription"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
            />
          </View>

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Amount
          </Text>
          <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor="#999"
            />
          </View>

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Frequency
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {frequencyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setFrequency(option)}
                className={`w-[48%] bg-[#1a1a1a] rounded-xl p-3 mb-2 items-center ${
                  frequency === option ? "border-2 border-blue-500" : ""
                }`}
              >
                <Text
                  className={`text-sm font-rubik ${frequency === option ? "text-blue-500" : "text-gray-300"}`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">
            Next Payment Date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(!showDatePicker)}
            className="bg-[#1a1a1a] rounded-2xl px-4 py-4 flex-row items-center justify-between"
          >
            <Text className="text-base font-rubik text-white">
              {nextPayDate.toLocaleDateString("en-GB")}
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

          <View className="flex-row justify-between mt-8 mb-4 gap-4">
            <TouchableOpacity
              onPress={() => router.replace("/bill")}
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
                {billId ? "Update" : "Add Bill"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
