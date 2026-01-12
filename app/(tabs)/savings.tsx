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
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-16 right-10 w-14 h-14 bg-[#a855f7] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-40 left-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 right-12 w-12 h-12 bg-[#10b981] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-6">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#ffd33d] border-2 border-black rounded-full items-center justify-center"
            style={retro.btnShadow}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
          <Text className="text-3xl font-rubik-bold text-black uppercase tracking-tight">
            Savings
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newSavings")}
          className="w-12 h-12 bg-[#A855F7] rounded-full items-center justify-center border-2 border-black"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6" showsVerticalScrollIndicator={false}>
        {/* STATS CARDS */}
        <View className="flex-row gap-3 mb-8">
          <View className={`flex-1 ${retro.card} p-4`} style={retro.btnShadow}>
            <View className="w-10 h-10 bg-[#A855F7] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="trophy" size={20} color="white" />
            </View>
            <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Total Saved
            </Text>
            <Text className="font-rubik-bold text-2xl text-black">
              ${totalSaved.toLocaleString()}
            </Text>
          </View>
          <View className={`flex-1 ${retro.card} p-4`} style={retro.btnShadow}>
            <View className="w-10 h-10 bg-[#3B82F6] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="pie-chart" size={20} color="white" />
            </View>
            <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Progress
            </Text>
            <Text className="font-rubik-bold text-2xl text-black">
              {completionRate.toFixed(0)}%
            </Text>
          </View>
        </View>

        {/* ACTIVE GOALS */}
        <View className="pb-10">
          {activeGoals.length > 0 && (
            <Text className="text-gray-500 font-rubik-bold mb-3 uppercase text-xs tracking-widest px-1">
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
                  className={`${retro.card} p-5 mb-4`}
                  style={retro.shadow}
                >
                  <View className="flex-row items-center gap-4 mb-4">
                    <View className="w-12 h-12 bg-[#A855F7] border-2 border-black rounded-lg items-center justify-center">
                      <Ionicons
                        name={getGoalIcon(item.name)}
                        size={24}
                        color="white"
                      />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-xl font-rubik-bold text-black">
                          {item.name}
                        </Text>
                        <Text className="text-[#A855F7] font-rubik-bold">
                          {percent}%
                        </Text>
                      </View>
                      <Text className="text-gray-500 text-xs font-rubik-bold mt-1 uppercase">
                        Tap to deposit funds
                      </Text>
                    </View>
                  </View>

                  <View className="h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-black relative">
                    <View
                      style={{ width: `${percent}%` }}
                      className="h-full bg-[#A855F7] rounded-full"
                    />
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-black font-rubik-bold">
                      ${item.currentAmount?.toLocaleString()}
                    </Text>
                    <Text className="text-gray-500 font-rubik-bold text-xs uppercase">
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
            <Text className="text-gray-500 font-rubik-bold mb-3 uppercase text-xs tracking-widest px-1 mt-4">
              Completed
            </Text>
            {completedGoals.map((item) => (
              <View
                key={item.id}
                className={`${retro.card} p-5 mb-4 border-[#A3E635] opacity-60`}
                style={retro.shadow}
              >
                <View className="flex-row items-center gap-4">
                  <Ionicons
                    name="checkmark-done-circle"
                    size={32}
                    color="#4ade80"
                  />
                  <View>
                    <Text className="text-lg font-rubik-bold text-gray-600 line-through decoration-gray-600">
                      {item.name}
                    </Text>
                    <Text className="text-[#4ade80] text-xs font-rubik-bold uppercase">
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

          <View
            className={`w-[85%] ${retro.card} p-6 items-center`}
            style={retro.shadow}
          >
            <View className="w-16 h-16 bg-[#A855F7] border-2 border-black rounded-full items-center justify-center mb-4">
              <Ionicons name="wallet" size={30} color="white" />
            </View>

            <Text className="text-black text-xl font-rubik-bold mb-1 uppercase tracking-tight">
              Add to {selectedGoal?.name}
            </Text>
            <Text className="text-gray-500 text-sm font-rubik-bold mb-6 text-center uppercase">
              How much would you like to deposit today?
            </Text>

            <View
              className={`w-full ${retro.card} p-4 flex-row items-center mb-6`}
            >
              <Text className="text-black text-2xl font-rubik-bold mr-2">
                $
              </Text>
              <TextInput
                className="flex-1 text-black text-2xl font-rubik-bold"
                placeholder="0"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={amountToAdd}
                onChangeText={setAmountToAdd}
                autoFocus
              />
            </View>

            <View className="flex-row gap-3 w-full">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-gray-300 p-4 rounded-2xl items-center border-2 border-black"
                style={retro.btnShadow}
              >
                <Text className="text-black font-rubik-bold uppercase">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeposit}
                disabled={loading}
                className="flex-1 bg-[#A855F7] p-4 rounded-2xl items-center border-2 border-black"
                style={retro.btnShadow}
              >
                <Text className="text-white font-rubik-bold uppercase">
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
