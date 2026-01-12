import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { calculateNextPayDate, getWeeklyIncome } from "@/utils/incomeUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✨ RETRO DESIGN SYSTEM
const retro = {
  bg: "bg-[#FFFDF5]", // Off-white paper background
  card: "bg-white border-2 border-black rounded-xl",
  // Hard Shadow Helper
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
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
  const { incomes, loading, refetchIncomes } = useFinanceStore();

  // --- ACTIONS ---

  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert("Confirm Delete", "Permanently delete this income source?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;
            await FinanceService.deleteItem("incomes", user.uid, id);
            refetchIncomes();
          } catch (error) {
            Alert.alert("Error", "Failed to delete income");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // --- MATH ---

  // 1. Weekly Estimate (Normalized)
  const weeklyEstimate = useMemo(() => {
    const weeklyAmounts = getWeeklyIncome(incomes); // Converts everything to weekly
    return weeklyAmounts.reduce((sum, item) => sum + item.amount, 0);
  }, [incomes]);

  // Loading State
  if (loading && incomes.length === 0) {
    return (
      <SafeAreaView
        className={`flex-1 items-center justify-center ${retro.bg}`}
      >
        <Text className="text-black font-rubik-bold">Loading Income...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-16 left-10 w-14 h-14 bg-[#10b981] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-40 right-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 left-12 w-12 h-12 bg-[#3b82f6] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      {/* HEADER */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-rubik-bold text-black uppercase tracking-tight">
            Income
          </Text>
          <Text className="text-sm font-rubik-bold text-gray-500 mt-1 uppercase tracking-widest">
            {incomes.length} Active{" "}
            {incomes.length === 1 ? "Source" : "Sources"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newIncome")}
          className="w-12 h-12 bg-[#10b981] rounded-full items-center justify-center border-2 border-black"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATS CARDS */}
        <View className="flex-row px-6 gap-3 mb-8">
          {/* Card 1: Weekly Power */}
          <View
            className={`flex-1 p-4 justify-between ${retro.card}`}
            style={retro.btnShadow}
          >
            <View className="w-10 h-10 bg-[#A3E635] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="flash" size={20} color="black" />
            </View>
            <View>
              <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Weekly Power
              </Text>
              <Text className="font-rubik-bold text-2xl text-black">
                ${weeklyEstimate.toFixed(0)}
              </Text>
            </View>
          </View>

          {/* Card 2: Sources */}
          <View
            className={`flex-1 p-4 justify-between ${retro.card}`}
            style={retro.btnShadow}
          >
            <View className="w-10 h-10 bg-[#2EC4B6] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="briefcase" size={20} color="black" />
            </View>
            <View>
              <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Active Streams
              </Text>
              <Text className="font-rubik-bold text-2xl text-black">
                {incomes.length}
              </Text>
            </View>
          </View>
        </View>

        {/* INCOME LIST */}
        <View className="px-6 pb-20">
          <Text className="text-black font-rubik-bold mb-3 uppercase text-sm opacity-50 ml-1">
            Your Sources
          </Text>

          {incomes.map((income) => {
            // Logic: Next Pay Date
            const nextPayDate = income.startDate
              ? calculateNextPayDate(income.startDate, income.frequency)
              : null;

            return (
              <SwipeableRow
                key={income.id}
                onSwipeLeft={() => handleDelete(income.id)}
                onSwipeRight={() =>
                  router.push({
                    pathname: "/newIncome",
                    params: { id: income.id },
                  })
                }
              >
                <View
                  className={`bg-white rounded-xl p-4 mb-3 border-2 border-black flex-row justify-between items-center`}
                  style={retro.btnShadow}
                >
                  {/* Icon & Details */}
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="w-12 h-12 bg-[#2EC4B6] rounded-xl items-center justify-center border-2 border-black">
                      <Ionicons name="cash-outline" size={24} color="black" />
                    </View>

                    <View>
                      <Text className="font-rubik-bold text-lg text-black">
                        {income.description}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <View className="bg-black px-2 py-0.5 rounded-md mr-2">
                          <Text className="text-[10px] text-white font-rubik-bold uppercase">
                            {income.frequency}
                          </Text>
                        </View>
                        <Text className="text-gray-500 text-xs font-rubik-bold uppercase">
                          {income.frequency === "One Time" ? "Paid" : "Next"}:{" "}
                          {nextPayDate
                            ? nextPayDate.toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })
                            : "N/A"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Amount */}
                  <Text className="font-rubik-bold text-lg text-black">
                    +${income.amount.toLocaleString()}
                  </Text>
                </View>
              </SwipeableRow>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomeDetails;
