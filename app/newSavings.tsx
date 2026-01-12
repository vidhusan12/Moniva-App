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
      <SafeAreaView className={`flex-1 ${retro.bg} justify-between px-6`}>
        {/* Decorative background shapes */}
        <View
          className="absolute top-24 right-8 w-12 h-12 bg-[#a855f7] rounded-full border-2 border-black opacity-15"
          style={retro.btnShadow}
        />
        <View
          className="absolute top-48 left-8 w-8 h-8 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
          style={retro.btnShadow}
        />
        <View
          className="absolute bottom-32 right-12 w-10 h-10 bg-[#10b981] rounded-lg border-2 border-black opacity-15"
          style={retro.btnShadow}
        />

        <Stack.Screen options={{ headerShown: false }} />

        {/* HEADER */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 bg-[#ef233c] border-2 border-black rounded-full self-start"
            style={retro.btnShadow}
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
            <Text className="text-black text-3xl font-rubik-bold mb-2 text-center uppercase tracking-tight">
              {savingId ? "EDIT GOAL" : "NEW GOAL"}
            </Text>
            <Text className="text-gray-500 text-center font-rubik-bold mb-10 uppercase tracking-wide text-xs">
              What are you saving towards?
            </Text>

            {/* Name Input */}
            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-rubik-bold">
                Goal Name
              </Text>
              <TextInput
                className="text-black text-xl font-rubik-bold"
                placeholder="e.g. New Car"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
              />
            </View>

            {/* Target Amount */}
            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-rubik-bold">
                Target Amount
              </Text>
              <View className="flex-row items-center">
                <Text className="text-[#A855F7] text-xl font-rubik-bold mr-1">
                  $
                </Text>
                <TextInput
                  className="text-black text-xl font-rubik-bold flex-1"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={targetAmount}
                  onChangeText={(t) => handleAmountChange(t, setTargetAmount)}
                  returnKeyType="done"
                />
              </View>
            </View>

            {/* Current Amount (Optional) */}
            <View
              className={`${retro.card} px-5 py-4 mb-4`}
              style={retro.shadow}
            >
              <Text className="text-gray-500 text-xs uppercase tracking-widest mb-1 font-rubik-bold">
                Already Saved (Optional)
              </Text>
              <View className="flex-row items-center">
                <Text className="text-gray-500 text-xl font-rubik-bold mr-1">
                  $
                </Text>
                <TextInput
                  className="text-black text-xl font-rubik-bold flex-1"
                  placeholder="0.00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={currentAmount}
                  onChangeText={(t) => handleAmountChange(t, setCurrentAmount)}
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* FOOTER BUTTON */}
        <View className="mb-4">
          <TouchableOpacity
            onPress={handleSubmit}
            className={`w-full py-5 rounded-full items-center border-2 border-black ${
              name && targetAmount ? "bg-[#A855F7]" : "bg-gray-300"
            }`}
            style={name && targetAmount ? retro.btnShadow : undefined}
            disabled={!name || !targetAmount}
          >
            <Text
              className={`font-rubik-bold text-lg uppercase tracking-tight ${name && targetAmount ? "text-white" : "text-gray-500"}`}
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
