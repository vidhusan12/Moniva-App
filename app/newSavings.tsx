import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { SavingsGoal } from "@/types/database";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const NewSaving = () => {
  const params = useLocalSearchParams();
  const savingId = params.id as string | undefined;

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");

  const optimisticallyAddSaving = useFinanceStore(
    (state) => state.optimisticallyAddSaving
  );
  const optimisticallyRemoveSaving = useFinanceStore(
    (state) => state.optimisticallyRemoveSaving
  );
  const refetchSavings = useFinanceStore((state) => state.refetchSavings);

  useEffect(() => {
    if (savingId) {
      const loadData = async () => {
        const user = auth.currentUser;
        if (!user) return;
        const item = await FinanceService.getItemById<SavingsGoal>(
          "savings",
          user.uid,
          savingId
        );
        if (item) {
          setName(item.name);
          setTargetAmount(item.targetAmount.toString());
          setCurrentAmount(item.currentAmount?.toString() || "");
        }
      };
      loadData();
    }
  }, [savingId]);

  const handleAmountChange = (text: string, setter: (val: string) => void) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    setter(cleaned);
  };

  async function handleSubmit() {
    const user = auth.currentUser;
    if (!user) return;

    if (!name || !targetAmount) {
      Alert.alert("Missing Info", "Please enter a name and target amount.");
      return;
    }

    const savingData = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      userId: user.uid,
    };

    if (savingId) {
      // Edit Mode
      await FinanceService.updateItem(
        "savings",
        user.uid,
        savingId,
        savingData
      );
      await refetchSavings();
      router.back();
    } else {
      // Add Mode (Optimistic)
      const tempId = `temp-${Date.now()}`;
      const tempSaving: SavingsGoal = { ...savingData, id: tempId };
      optimisticallyAddSaving(tempSaving);
      router.back();

      try {
        await FinanceService.addItem("savings", user.uid, savingData);
        await refetchSavings();
      } catch (error) {
        optimisticallyRemoveSaving(tempId);
        Alert.alert("Error", "Could not save goal.");
      }
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-black justify-between px-6">
        <Stack.Screen options={{ headerShown: false }} />

        {/* HEADER */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-white/10 rounded-full self-start"
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* MAIN FORM */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center"
        >
          <View>
            <Text className="text-white text-3xl font-rubik-bold mb-2 text-center">
              {savingId ? "Edit Goal" : "New Goal"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik mb-10">
              What are you saving towards?
            </Text>

            {/* Name Input */}
            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Goal Name
              </Text>
              <TextInput
                className="text-white text-xl font-rubik-medium"
                placeholder="e.g. New Car"
                placeholderTextColor="#444"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Target Amount */}
            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Target Amount
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
                  value={targetAmount}
                  onChangeText={(t) => handleAmountChange(t, setTargetAmount)}
                />
              </View>
            </View>

            {/* Current Amount (Optional) */}
            <View className="bg-[#1a1a1a] rounded-2xl px-5 py-4 mb-4 border border-white/5">
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1">
                Already Saved (Optional)
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-xl font-rubik-bold mr-1">
                  $
                </Text>
                <TextInput
                  className="text-white text-xl font-rubik-medium flex-1"
                  placeholder="0.00"
                  placeholderTextColor="#444"
                  keyboardType="numeric"
                  value={currentAmount}
                  onChangeText={(t) => handleAmountChange(t, setCurrentAmount)}
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* FOOTER BUTTON */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-5 rounded-full items-center ${
              name && targetAmount ? "bg-teal-500" : "bg-gray-800"
            }`}
            disabled={!name || !targetAmount}
          >
            <Text
              className={`font-rubik-bold text-lg ${name && targetAmount ? "text-white" : "text-gray-500"}`}
            >
              {savingId ? "Update Goal" : "Create Goal"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default NewSaving;
