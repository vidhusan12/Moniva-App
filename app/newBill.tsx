import { addBill, fetchBillById, updateBill, Bill } from "@/services/bill";
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
// 🏆 Import the Zustand store
import { useFinanceStore } from "@/store/financeStore"; 

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
  const optimisticallyAddBill = useFinanceStore(state => state.optimisticallyAddBill);
  const optimisticallyRemoveBill = useFinanceStore(state => state.optimisticallyRemoveBill);
  const refetchBills = useFinanceStore(state => state.refetchBills);

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
          const bill = await fetchBillById(billId);

          if (bill) {
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
    // 1. Validation
    if (!amount || !description || !frequency || !nextPayDate) {
      Alert.alert("Missing Information", "Please fill in all the information.");
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid amount.");
      return;
    }

    // 2. Prepare Data Object
    const billData: Bill = {
      description: description,
      amount: numericAmount,
      frequency: frequency,
      startDate: formatDateForMongo(nextPayDate),
      date: formatDateForMongo(nextPayDate), 
    };

    if (billId) {
        // --- Edit Mode: Standard Approach ---
        try {
            await updateBill(billId, billData);
            await refetchBills(); 
            router.replace("/bill");
        } catch (error) {
            console.error("Failed to update bill:", error);
            Alert.alert("Error", "Failed to update bill.");
        }
    } else {
        // --- Add Mode: OPTIMISTIC Approach ---
        
        // 1. Create a temporary ID and add to UI instantly
        const tempBill: Bill = { ...billData, _id: `temp-${Date.now()}` };
        optimisticallyAddBill(tempBill);
        
        // 2. Navigate away immediately for a fast feel
        router.replace("/bill");

        // 3. Save to database in the background
        try {
            await addBill(billData);
            // 4. Update store with official DB data
            await refetchBills();
        } catch (error) {
            // 5. Rollback on failure
            console.error("Failed to save bill:", error);
            optimisticallyRemoveBill(tempBill._id!); 
            Alert.alert("Error", "Failed to save bill. The entry has been rolled back.");
        }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <TouchableOpacity onPress={() => router.replace("/bill")} className="p-3 ml-2">
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
          <Text className="text-base font-rubik text-gray-300 mb-2">Description</Text>
          <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4">
            <TextInput
              className="text-base font-rubik text-white"
              placeholder="e.g. Rent, Subscription"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#999"
            />
          </View>

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">Amount</Text>
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

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">Frequency</Text>
          <View className="flex-row flex-wrap justify-between">
            {frequencyOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setFrequency(option)}
                className={`w-[48%] bg-[#1a1a1a] rounded-xl p-3 mb-2 items-center ${
                  frequency === option ? "border-2 border-blue-500" : ""
                }`}
              >
                <Text className={`text-sm font-rubik ${frequency === option ? "text-blue-500" : "text-gray-300"}`}>
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base font-rubik text-gray-300 mb-2 mt-4">Next Payment Date</Text>
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
              <Text className="text-base font-rubik-medium text-gray-300">Cancel</Text>
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