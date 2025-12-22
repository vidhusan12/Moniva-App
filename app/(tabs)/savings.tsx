import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
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

// Helper for Icons
const getGoalIcon = (name: string): keyof typeof Ionicons.glyphMap => {
  const lower = name.toLowerCase();
  if (lower.includes("car") || lower.includes("vehicle")) return "car-sport";
  if (
    lower.includes("house") ||
    lower.includes("home") ||
    lower.includes("rent")
  )
    return "home";
  if (lower.includes("emergency")) return "medkit";
  if (lower.includes("trip") || lower.includes("vacation")) return "airplane";
  if (lower.includes("phone") || lower.includes("tech")) return "hardware-chip";
  return "wallet";
};

const Savings = () => {
  const { savings, refetchSavings } = useFinanceStore();

  // 🟢 NEW: State for the "Deposit" Pop-up
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [amountToAdd, setAmountToAdd] = useState("");
  const [loading, setLoading] = useState(false);

  // --- ACTIONS ---

  const handleDelete = async (id?: string) => {
    if (!id) return;
    Alert.alert("Delete Goal", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const user = auth.currentUser;
          if (user) {
            await FinanceService.deleteItem("savings", user.uid, id);
            refetchSavings();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const openDepositModal = (goal: any) => {
    setSelectedGoal(goal);
    setAmountToAdd(""); // Reset input
    setModalVisible(true);
  };

  const handleDeposit = async () => {
    if (!amountToAdd || isNaN(Number(amountToAdd)) || !selectedGoal) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      // 🧠 LOGIC: Add the new amount to the existing currentAmount
      const currentTotal = selectedGoal.currentAmount || 0;
      const deposit = parseFloat(amountToAdd);
      const newTotal = currentTotal + deposit;

      // Update Firebase
      await FinanceService.updateItem("savings", user.uid, selectedGoal.id, {
        currentAmount: newTotal,
      });

      // Close and Refresh
      setModalVisible(false);
      refetchSavings();
      Alert.alert("Success", `Added $${deposit} to ${selectedGoal.name}! 🚀`);
    } catch (error) {
      Alert.alert("Error", "Failed to update savings.");
    } finally {
      setLoading(false);
    }
  };

  // --- MATH ---
  const {
    totalSaved,
    totalTarget,
    completionRate,
    activeGoals,
    completedGoals,
  } = useMemo(() => {
    const totalSaved = savings.reduce(
      (sum, s) => sum + (s.currentAmount || 0),
      0
    );
    const totalTarget = savings.reduce((sum, s) => sum + s.targetAmount, 0);
    const completed = savings.filter(
      (s) => (s.currentAmount || 0) >= s.targetAmount
    );
    const active = savings.filter(
      (s) => (s.currentAmount || 0) < s.targetAmount
    );
    const completionRate =
      totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;
    return {
      totalSaved,
      totalTarget,
      completionRate,
      activeGoals: active,
      completedGoals: completed,
    };
  }, [savings]);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-6">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-3xl font-rubik-bold text-white">Savings</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newSavings")}
          className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* STATS CARDS */}
        <View className="flex-row gap-3 mb-8">
          <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-purple-500/20">
            <View className="w-10 h-10 bg-purple-500/10 rounded-full items-center justify-center mb-3">
              <Ionicons name="trophy" size={20} color="#a855f7" />
            </View>
            <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Total Saved
            </Text>
            <Text className="font-rubik-bold text-2xl text-white">
              ${totalSaved.toLocaleString()}
            </Text>
          </View>
          <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-blue-500/20">
            <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center mb-3">
              <Ionicons name="pie-chart" size={20} color="#3b82f6" />
            </View>
            <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Progress
            </Text>
            <Text className="font-rubik-bold text-2xl text-white">
              {completionRate.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* ACTIVE GOALS */}
        <View className="pb-10">
          {activeGoals.length > 0 && (
            <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1">
              In Progress
            </Text>
          )}

          {activeGoals.map((item) => {
            const progress =
              item.targetAmount > 0
                ? (item.currentAmount || 0) / item.targetAmount
                : 0;
            const percent = Math.min(100, Math.round(progress * 100));
            const remaining = item.targetAmount - (item.currentAmount || 0);

            return (
              <SwipeableRow
                key={item.id}
                onSwipeLeft={() => handleDelete(item.id)}
                onSwipeRight={() =>
                  router.push({
                    pathname: "/newSavings",
                    params: { id: item.id },
                  })
                }
              >
                {/* 👇 CHANGED: Wrapped in TouchableOpacity to open modal */}
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openDepositModal(item)}
                  className="bg-[#1a1a1a] rounded-3xl p-5 mb-4 border border-white/5"
                >
                  <View className="flex-row items-center gap-4 mb-4">
                    <View className="w-12 h-12 bg-purple-500/10 rounded-full items-center justify-center border border-purple-500/20">
                      <Ionicons
                        name={getGoalIcon(item.name)}
                        size={24}
                        color="#a855f7"
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xl font-rubik-bold text-white">
                          {item.name}
                        </Text>
                        <Text className="text-purple-400 font-rubik-bold">
                          {percent}%
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-xs font-rubik mt-1">
                        Tap to deposit funds
                      </Text>
                    </View>
                  </View>

                  <View className="h-4 bg-black rounded-full overflow-hidden border border-white/5 relative">
                    <View
                      style={{ width: `${percent}%` }}
                      className="h-full bg-purple-500 rounded-full"
                    />
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-gray-300 font-rubik-medium">
                      ${item.currentAmount?.toLocaleString()}
                    </Text>
                    <Text className="text-gray-500 font-rubik text-xs">
                      Goal: ${item.targetAmount.toLocaleString()}
                    </Text>
                  </View>
                </TouchableOpacity>
              </SwipeableRow>
            );
          })}
        </View>

        {/* COMPLETED GOALS */}
        {completedGoals.length > 0 && (
          <View className="pb-20">
            <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1 mt-4">
              Completed
            </Text>
            {completedGoals.map((item) => (
              <View
                key={item.id}
                className="bg-[#1a1a1a] rounded-3xl p-5 mb-4 border border-green-500/20 opacity-60"
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons
                    name="checkmark-done-circle"
                    size={32}
                    color="#4ade80"
                  />
                  <View>
                    <Text className="text-lg font-rubik-medium text-white line-through decoration-white/50">
                      {item.name}
                    </Text>
                    <Text className="text-green-500 text-xs font-rubik">
                      Target Reached!
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* 🟢 DEPOSIT MODAL */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-center items-center bg-black/80"
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="absolute inset-0" />
          </TouchableWithoutFeedback>

          <View className="bg-[#1a1a1a] w-[85%] rounded-[32px] p-6 border border-white/10 items-center">
            <View className="w-16 h-16 bg-purple-500/20 rounded-full items-center justify-center mb-4">
              <Ionicons name="wallet" size={30} color="#a855f7" />
            </View>

            <Text className="text-white text-xl font-rubik-bold mb-1">
              Add to {selectedGoal?.name}
            </Text>
            <Text className="text-gray-400 text-sm font-rubik mb-6 text-center">
              How much would you like to deposit today?
            </Text>

            <View className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 flex-row items-center mb-6">
              <Text className="text-white text-2xl font-rubik-bold mr-2">
                $
              </Text>
              <TextInput
                className="flex-1 text-white text-2xl font-rubik-bold"
                placeholder="0"
                placeholderTextColor="#4b5563"
                keyboardType="numeric"
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                autoFocus
              />
            </View>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-[#2a2a2a] p-4 rounded-2xl items-center"
              >
                <Text className="text-white font-rubik-medium">Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeposit}
                disabled={loading}
                className="flex-1 bg-purple-600 p-4 rounded-2xl items-center"
              >
                <Text className="text-white font-rubik-bold">
                  {loading ? "Adding..." : "Deposit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Savings;
