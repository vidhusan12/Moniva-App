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
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Income...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      
      {/* HEADER */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-rubik-bold text-white">
            Income
          </Text>
          <Text className="text-sm font-rubik text-gray-400 mt-1">
            {incomes.length} Active {incomes.length === 1 ? "Source" : "Sources"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newIncome")}
          className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* STATS CARDS */}
        <View className="flex-row px-6 gap-3 mb-8">
            
            {/* Card 1: Weekly Power */}
            <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-green-500/20">
                <View className="w-10 h-10 bg-green-500/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="flash" size={20} color="#4ade80" />
                </View>
                <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Weekly Power
                </Text>
                <Text className="font-rubik-bold text-2xl text-white">
                    ${weeklyEstimate.toFixed(0)}
                </Text>
                <Text className="font-rubik text-[10px] text-gray-500 mt-1">
                    Est. per week
                </Text>
            </View>

            {/* Card 2: Sources */}
            <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-teal-500/20">
                <View className="w-10 h-10 bg-teal-500/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="briefcase" size={20} color="#2dd4bf" />
                </View>
                <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Active Streams
                </Text>
                <Text className="font-rubik-bold text-2xl text-white">
                    {incomes.length}
                </Text>
                <Text className="font-rubik text-[10px] text-gray-500 mt-1">
                    Consistent income
                </Text>
            </View>
        </View>

        {/* INCOME LIST */}
        <View className="px-6 pb-20">
          <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1">
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
                <View className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-white/5 flex-row justify-between items-center">
                  
                  {/* Icon & Details */}
                  <View className="flex-row items-center gap-4 flex-1">
                    <View className="w-12 h-12 bg-green-500/10 rounded-full items-center justify-center border border-green-500/20">
                         <Ionicons name="cash-outline" size={24} color="#4ade80" />
                    </View>
                    
                    <View>
                        <Text className="font-rubik-medium text-lg text-white">
                            {income.description}
                        </Text>
                        
                        <View className="flex-row items-center mt-1">
                            <View className="bg-white/10 px-2 py-0.5 rounded-md mr-2">
                                <Text className="text-[10px] text-gray-300 font-rubik uppercase">
                                    {income.frequency}
                                </Text>
                            </View>
                            <Text className="text-gray-500 text-xs">
                                Next: {nextPayDate ? nextPayDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' }) : "N/A"}
                            </Text>
                        </View>
                    </View>
                  </View>

                  {/* Amount */}
                  <Text className="font-rubik-bold text-lg text-green-400">
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