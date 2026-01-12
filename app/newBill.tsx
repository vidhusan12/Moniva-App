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
  Modal,
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
          setAmount(bill.amount.toFixed(2));
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
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-24 right-8 w-12 h-12 bg-[#ef233c] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-48 left-8 w-8 h-8 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-32 right-12 w-10 h-10 bg-[#fb923c] rounded-lg border-2 border-black opacity-15"
          style={retro.btnShadow}
        />

        <Stack.Screen options={{ headerShown: false }} />

        <View className="mt-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-[#ef233c] border-2 border-black rounded-full"
            style={retro.btnShadow}
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
            <Text className="text-black text-3xl font-rubik-bold mt-4 text-center tracking-tight">
              {billId ? "EDIT BILL" : "NEW BILL"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik-bold mb-10 mt-1 uppercase tracking-wide text-xs">
              Add a recurring expense
            </Text>

            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-rubik-bold">
                Description
              </Text>
              <TextInput
                className="text-black text-xl font-rubik-bold py-1"
                placeholder="e.g. Netflix"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-rubik-bold">
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-[#FF6B6B] text-xl font-rubik-bold mr-2">
                  $
                </Text>
                <TextInput
                  className="text-black text-xl font-rubik-bold flex-1 py-1"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={handleAmountChange}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 ml-2 font-rubik-bold">
                Frequency
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFrequency(option)}
                    className={`px-4 py-3 rounded-xl border-2 border-black ${
                      frequency === option ? "bg-[#A3E635]" : "bg-white"
                    }`}
                    style={frequency === option ? retro.btnShadow : undefined}
                  >
                    <Text
                      className={`font-rubik-bold text-sm uppercase ${frequency === option ? "text-black" : "text-gray-600"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row justify-between items-center"
              >
                <View>
                  <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-rubik-bold">
                    Due Date
                  </Text>
                  <Text className="text-black text-xl font-rubik-bold">
                    {nextPayDate.toLocaleDateString("en-GB", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </Text>
                </View>
                <Ionicons name="calendar-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* iOS Date Picker Modal */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View className="flex-1 bg-black/50 justify-center items-center">
                <TouchableWithoutFeedback>
                  <View
                    className={`mx-6 p-4 ${retro.card}`}
                    style={retro.shadow}
                  >
                    <Text className="text-black font-rubik-bold text-center mb-4 uppercase tracking-tight">
                      Select Due Date
                    </Text>
                    <DateTimePicker
                      value={nextPayDate}
                      mode="date"
                      display="inline"
                      onChange={onChangeDate}
                      themeVariant="light"
                      accentColor="#FF6B6B"
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-[#A3E635] py-3 rounded-xl items-center border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Text className="text-black font-rubik-bold uppercase">
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
            onChange={onChangeDate}
          />
        )}

        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-5 rounded-full items-center border-2 border-black ${
              amount && description ? "bg-[#FF6B6B]" : "bg-gray-300"
            }`}
            style={amount && description ? retro.btnShadow : undefined}
            disabled={!amount || !description}
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-tight ${amount && description ? "text-white" : "text-gray-500"}`}
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
