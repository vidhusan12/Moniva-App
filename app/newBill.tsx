import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { Bill } from "@/types/database";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BillDetails = () => {
  const params = useLocalSearchParams();
  const billId = params.id as string | undefined;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencyOptions = [
    "Weekly",
    "Fortnightly",
    "Monthly",
    "Quarterly",
    "Annual",
  ];

  const optimisticallyAddBill = useFinanceStore(
    (state) => state.optimisticallyAddBill
  );
  const optimisticallyRemoveBill = useFinanceStore(
    (state) => state.optimisticallyRemoveBill
  );
  const refetchBills = useFinanceStore((state) => state.refetchBills);

  useEffect(() => {
    if (billId) {
      const loadBill = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const bill = await FinanceService.getItemById<Bill>(
          "bills",
          user.uid,
          billId
        );
        if (bill) {
          setAmount(bill.amount.toString());
          setDescription(bill.description);
          setFrequency(bill.frequency);
          if (bill.startDate) setNextPayDate(new Date(bill.startDate));
        }
      };
      loadBill();
    }
  }, [billId]);

  const onChangeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setNextPayDate(selectedDate);
  };

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    setAmount(cleaned);
  };

  async function handleSubmit() {
    const user = auth.currentUser;
    if (!user) return;

    if (!amount || !description) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    const billData = {
      description,
      amount: parseFloat(amount),
      frequency,
      startDate: nextPayDate.toISOString(),
      date: nextPayDate.toISOString(),
      status: "unpaid" as const,
      userId: user.uid,
    };

    if (billId) {
      await FinanceService.updateItem("bills", user.uid, billId, billData);
      await refetchBills();
      router.back();
    } else {
      const tempId = `temp-${Date.now()}`;
      optimisticallyAddBill({ ...billData, id: tempId });
      router.back();
      try {
        await FinanceService.addItem("bills", user.uid, billData);
        await refetchBills();
      } catch (error) {
        optimisticallyRemoveBill(tempId);
        Alert.alert("Error", "Failed to save bill.");
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-black justify-between px-6">
        <Stack.Screen options={{ headerShown: false }} />

        <View className="mt-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/10 rounded-full"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <Text className="text-white text-3xl font-rubik-bold mt-4 text-center">
              {billId ? "Edit Bill" : "New Bill"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik mb-10 mt-1">
              Add a recurring expense
            </Text>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Description
              </Text>
              <TextInput
                className="text-white text-xl font-rubik-medium"
                placeholder="e.g. Netflix"
                placeholderTextColor="#444"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-teal-500 text-xl font-rubik-bold mr-1">
                  $
                </Text>
                <TextInput
                  className="text-white text-xl font-rubik-medium flex-1"
                  placeholder="0.00"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 ml-2">
                Frequency
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFrequency(option)}
                    className={`px-4 py-3 rounded-xl border ${
                      frequency === option
                        ? "bg-teal-500/20 border-teal-500"
                        : "bg-[#1a1a1a] border-white/5"
                    }`}
                  >
                    <Text
                      className={`font-rubik-medium text-sm ${frequency === option ? "text-teal-400" : "text-gray-400"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <TouchableOpacity
                onPress={() => setShowDatePicker(!showDatePicker)}
                className="flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                    Due Date
                  </Text>
                  <Text className="text-white text-xl font-rubik-medium">
                    {nextPayDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
                <Ionicons name="calendar-outline" size={24} color="#666" />
              </TouchableOpacity>
              {showDatePicker && (
                <View className="mt-4">
                  <DateTimePicker
                    value={nextPayDate}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onChangeDate}
                    themeVariant="dark"
                    textColor="white"
                  />
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-5 rounded-full items-center ${
              amount && description ? "bg-teal-500" : "bg-gray-800"
            }`}
            disabled={!amount || !description}
          >
            <Text
              className={`font-rubik-bold text-lg ${amount && description ? "text-white" : "text-gray-500"}`}
            >
              {billId ? "Update Bill" : "Add Bill"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default BillDetails;
