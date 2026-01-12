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

// ✨ RETRO DESIGN SYSTEM
const retro = {
  bg: "bg-[#FFFDF5]",
  card: "bg-white border-2 border-black rounded-xl",
  input: "text-black text-xl font-rubik-medium",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  btnShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
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

const IncomeDetails = () => {
  const params = useLocalSearchParams();
  const incomeId = params.id as string | undefined;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [nextPayDate, setNextPayDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  // Store Selectors
  const optimisticallyAddIncome = useFinanceStore(
    (state) => state.optimisticallyAddIncome
  );
  const optimisticallyRemoveIncome = useFinanceStore(
    (state) => state.optimisticallyRemoveIncome
  );
  const refetchIncomes = useFinanceStore((state) => state.refetchIncomes);

  // Load Data
  useEffect(() => {
    if (incomeId) {
      const loadIncome = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const income = await FinanceService.getItemById<Income>(
          "incomes",
          user.uid,
          incomeId
        );
        if (income) {
          setAmount(income.amount.toFixed(2));
          setDescription(income.description);
          setFrequency(income.frequency);
          // Calculate and show the NEXT pay date, not the original startDate
          if (income.startDate) {
            const { calculateNextPayDate } = require("@/utils/incomeUtils");
            const nextDate = calculateNextPayDate(
              income.startDate,
              income.frequency
            );
            setNextPayDate(nextDate);
          }
        }
      };
      loadIncome();
    }
  }, [incomeId]);

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

    if (!amount || !description || !frequency) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    const incomeData = {
      description,
      amount: parseFloat(amount),
      frequency,
      startDate: nextPayDate.toISOString(),
      date: nextPayDate.toISOString(),
      userId: user.uid,
    };

    if (incomeId) {
      await FinanceService.updateItem(
        "incomes",
        user.uid,
        incomeId,
        incomeData
      );
      await refetchIncomes();
      router.back();
    } else {
      const tempId = `temp-${Date.now()}`;
      optimisticallyAddIncome({ ...incomeData, id: tempId });
      router.back();

      try {
        await FinanceService.addItem("incomes", user.uid, incomeData);
        await refetchIncomes();
      } catch (error) {
        optimisticallyRemoveIncome(tempId);
        Alert.alert("Error", "Failed to save income.");
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-24 left-8 w-12 h-12 bg-[#10b981] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-48 right-8 w-8 h-8 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-32 left-12 w-10 h-10 bg-[#3b82f6] rounded-lg border-2 border-black opacity-15"
          style={retro.btnShadow}
        />

        <Stack.Screen options={{ headerShown: false }} />

        {/* HEADER */}
        <View className="mt-4 flex-row justify-between items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#ef233c] border-2 border-black rounded-full items-center justify-center"
            style={retro.btnShadow}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* MAIN FORM */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            <View className="items-center mt-4 mb-8">
              <View
                className="w-16 h-16 bg-[#10b981] border-2 border-black rounded-2xl items-center justify-center mb-4"
                style={retro.shadow}
              >
                <Ionicons
                  name={incomeId ? "create" : "add"}
                  size={32}
                  color="white"
                />
              </View>
              <Text className="text-black text-3xl font-rubik-bold text-center uppercase">
                {incomeId ? "Edit Income" : "New Income"}
              </Text>
              <Text className="text-gray-500 text-center font-rubik-medium mt-1 uppercase text-xs tracking-widest">
                Add your salary or side hustle
              </Text>
            </View>

            {/* Description Input */}
            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.btnShadow}
            >
              <Text className="text-black text-xs font-rubik-bold uppercase tracking-widest mb-2 opacity-50">
                Source Name
              </Text>
              <TextInput
                className={retro.input}
                placeholder="e.g. Salary"
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {/* Amount Input */}
            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.btnShadow}
            >
              <Text className="text-black text-xs font-rubik-bold uppercase tracking-widest mb-2 opacity-50">
                Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-black text-xl font-rubik-bold mr-2">
                  $
                </Text>
                <TextInput
                  className={`${retro.input} flex-1`}
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  value={amount}
                  onChangeText={handleAmountChange}
                />
              </View>
            </View>

            {/* Frequency Selector */}
            <View className="mb-6">
              <Text className="text-black text-xs font-rubik-bold uppercase tracking-widest mb-3 ml-1 opacity-50">
                Frequency
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option}
                    onPress={() => setFrequency(option)}
                    className={`px-4 py-3 rounded-xl border-2 border-black ${
                      frequency === option
                        ? "bg-[#A3E635]" // Active Color
                        : "bg-white"
                    }`}
                    style={retro.btnShadow}
                  >
                    <Text
                      className={`font-rubik-bold text-xs uppercase ${frequency === option ? "text-black" : "text-gray-500"}`}
                    >
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Date Picker */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className={`${retro.card} px-5 py-4 mb-4 flex-row justify-between items-center`}
              style={retro.btnShadow}
            >
              <View>
                <Text className="text-black text-xs font-rubik-bold uppercase tracking-widest mb-1 opacity-50">
                  Next Pay Date
                </Text>
                <Text className="text-black text-xl font-rubik-bold">
                  {nextPayDate.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </View>
              <View className="bg-gray-100 p-2 rounded-lg border-2 border-black">
                <Ionicons name="calendar" size={20} color="black" />
              </View>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* iOS Date Picker Modal (Styled Light) */}
        {showDatePicker && Platform.OS === "ios" && (
          <Modal transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setShowDatePicker(false)}>
              <View className="flex-1 bg-black/20 justify-center items-center px-6">
                <TouchableWithoutFeedback>
                  <View
                    className="bg-white w-full p-6 rounded-2xl border-2 border-black"
                    style={retro.shadow}
                  >
                    <Text className="text-black font-rubik-bold text-center text-lg mb-4 uppercase">
                      Select Pay Date
                    </Text>
                    <DateTimePicker
                      value={nextPayDate}
                      mode="date"
                      display="inline"
                      onChange={onChangeDate}
                      themeVariant="light" // Switched to Light
                      accentColor="#2dd4bf"
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-black py-4 rounded-xl items-center"
                    >
                      <Text className="text-white font-rubik-bold uppercase">
                        Confirm Date
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

        {/* FOOTER BUTTON */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-4 rounded-xl items-center border-2 border-black ${
              amount && description ? "bg-[#2EC4B6]" : "bg-gray-200"
            }`}
            style={amount && description ? retro.shadow : {}}
            disabled={!amount || !description}
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-widest ${amount && description ? "text-black" : "text-gray-400"}`}
            >
              {incomeId ? "Save Changes" : "Add Income"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default IncomeDetails;
