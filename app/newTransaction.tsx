import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { Transaction } from "@/types/database";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
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

const NewTransaction = () => {
  const params = useLocalSearchParams();
  const transactionId = params.id as string | undefined;

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const optimisticallyAddTransaction = useFinanceStore(
    (state) => state.optimisticallyAddTransaction
  );
  const optimisticallyRemoveTransaction = useFinanceStore(
    (state) => state.optimisticallyRemoveTransaction
  );
  const refetchTransactions = useFinanceStore(
    (state) => state.refetchTransactions
  );

  useEffect(() => {
    if (transactionId) {
      const loadTransaction = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const transaction = await FinanceService.getItemById<Transaction>(
          "transactions",
          user.uid,
          transactionId
        );
        if (transaction) {
          setTitle(transaction.description);
          setAmount(transaction.amount.toFixed(2));
          setSelectedCategory(transaction.category);
          if (transaction.date) setDate(new Date(transaction.date));
        }
      };
      loadTransaction();
    }
  }, [transactionId]);

  const handleAmountChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    setAmount(cleaned);
  };

  async function handleSubmit() {
    const user = auth.currentUser;
    if (!user) return;

    if (!title || !amount || !selectedCategory) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    const transactionData = {
      description: title,
      amount: parseFloat(amount),
      category: selectedCategory,
      date: date.toISOString(),
      userId: user.uid,
    };

    if (transactionId) {
      await FinanceService.updateItem(
        "transactions",
        user.uid,
        transactionId,
        transactionData
      );
      await refetchTransactions();
      router.back();
    } else {
      const tempId = `temp-${Date.now()}`;
      optimisticallyAddTransaction({ ...transactionData, id: tempId });
      router.back();
      try {
        await FinanceService.addItem("transactions", user.uid, transactionData);
        await refetchTransactions();
      } catch (error) {
        optimisticallyRemoveTransaction(tempId);
        Alert.alert("Error", "Failed to save transaction.");
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-24 right-8 w-12 h-12 bg-[#fb923c] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-48 left-8 w-8 h-8 bg-[#a855f7] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-32 right-12 w-10 h-10 bg-[#3b82f6] rounded-lg border-2 border-black opacity-15"
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
            <Text className="text-black text-3xl font-rubik-bold mt-4 text-center tracking-tight uppercase">
              {transactionId ? "EDIT EXPENSE" : "NEW EXPENSE"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik-bold mb-10 mt-1 uppercase tracking-wide text-xs">
              Track your daily spending
            </Text>

            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 font-rubik-bold">
                What was it?
              </Text>
              <TextInput
                className="text-black text-xl font-rubik-bold py-1"
                placeholder="e.g. Coffee"
                placeholderTextColor="#999"
                value={title}
                onChangeText={setTitle}
                autoCapitalize="sentences"
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
                <Text className="text-[#FFD93D] text-xl font-rubik-bold mr-2">
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
                Category
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => setSelectedCategory(cat.name)}
                    className={`flex-row items-center px-4 py-3 rounded-xl border-2 border-black ${
                      selectedCategory === cat.name
                        ? "bg-[#A3E635]"
                        : "bg-white"
                    }`}
                    style={
                      selectedCategory === cat.name
                        ? retro.btnShadow
                        : undefined
                    }
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={16}
                      color="black"
                      style={{ marginRight: 6 }}
                    />
                    <Text
                      className={`font-rubik-bold text-sm uppercase ${selectedCategory === cat.name ? "text-black" : "text-gray-600"}`}
                    >
                      {cat.name}
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
                    Date
                  </Text>
                  <Text className="text-black text-xl font-rubik-bold">
                    {date.toLocaleDateString("en-GB", {
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
                      Select Date
                    </Text>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="inline"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) setDate(selectedDate);
                      }}
                      themeVariant="light"
                      accentColor="#FFD93D"
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
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-5 rounded-full items-center border-2 border-black ${
              amount && title && selectedCategory
                ? "bg-[#FFD93D]"
                : "bg-gray-300"
            }`}
            style={
              amount && title && selectedCategory ? retro.btnShadow : undefined
            }
            disabled={!amount || !title || !selectedCategory}
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-tight ${amount && title && selectedCategory ? "text-black" : "text-gray-500"}`}
            >
              {transactionId ? "Update Expense" : "Add Expense"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default NewTransaction;
