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

  const optimisticallyAddTransaction = useFinanceStore((state) => state.optimisticallyAddTransaction);
  const optimisticallyRemoveTransaction = useFinanceStore((state) => state.optimisticallyRemoveTransaction);
  const refetchTransactions = useFinanceStore((state) => state.refetchTransactions);

  useEffect(() => {
    if (transactionId) {
      const loadTransaction = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const transaction = await FinanceService.getItemById<Transaction>("transactions", user.uid, transactionId);
        if (transaction) {
          setTitle(transaction.description);
          setAmount(transaction.amount.toString());
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
      await FinanceService.updateItem("transactions", user.uid, transactionId, transactionData);
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
      <SafeAreaView className="flex-1 bg-black justify-between px-6">
        <Stack.Screen options={{ headerShown: false }} />

        <View className="mt-4 flex-row justify-between items-center">
          <TouchableOpacity onPress={() => router.back()} className="p-2 bg-white/10 rounded-full">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            
            <Text className="text-white text-3xl font-rubik-bold mt-4 text-center">
              {transactionId ? "Edit Expense" : "New Expense"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik mb-10 mt-1">
              Track your daily spending
            </Text>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
                <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">What was it?</Text>
                <TextInput
                    className="text-white text-xl font-rubik-medium"
                    placeholder="e.g. Coffee"
                    placeholderTextColor="#444"
                    value={title}
                    onChangeText={setTitle}
                />
            </View>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
                <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">Amount</Text>
                <View className="flex-row items-center">
                    <Text className="text-teal-500 text-xl font-rubik-bold mr-1">$</Text>
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
                <Text className="text-gray-500 text-xs uppercase tracking-widest mb-2 ml-2">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                    {categories.map((cat) => (
                        <TouchableOpacity
                            key={cat.name}
                            onPress={() => setSelectedCategory(cat.name)}
                            className={`flex-row items-center px-4 py-3 rounded-xl border ${
                                selectedCategory === cat.name 
                                ? "bg-teal-500/20 border-teal-500" 
                                : "bg-[#1a1a1a] border-white/5"
                            }`}
                        >
                            <Ionicons 
                                name={cat.icon as any} 
                                size={16} 
                                color={selectedCategory === cat.name ? "#2dd4bf" : "#666"} 
                                style={{ marginRight: 6 }}
                            />
                            <Text className={`font-rubik-medium text-sm ${selectedCategory === cat.name ? "text-teal-400" : "text-gray-400"}`}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
                <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)} className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">Date</Text>
                        <Text className="text-white text-xl font-rubik-medium">
                            {date.toLocaleDateString("en-GB", { weekday: 'short', day: 'numeric', month: 'short' })}
                        </Text>
                    </View>
                    <Ionicons name="calendar-outline" size={24} color="#666" />
                </TouchableOpacity>
                {showDatePicker && (
                    <View className="mt-4">
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display={Platform.OS === "ios" ? "spinner" : "default"}
                            onChange={(event, selectedDate) => {
                                if (Platform.OS === "android") setShowDatePicker(false);
                                if (selectedDate) setDate(selectedDate);
                            }}
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
              amount && title && selectedCategory ? "bg-teal-500" : "bg-gray-800"
            }`}
            disabled={!amount || !title || !selectedCategory}
          >
            <Text className={`font-rubik-bold text-lg ${amount && title && selectedCategory ? "text-white" : "text-gray-500"}`}>
              {transactionId ? "Update Expense" : "Add Expense"}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default NewTransaction;