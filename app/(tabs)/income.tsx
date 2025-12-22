import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase"; // 🛡️ Required for path security
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { calculateNextPayDate } from "@/utils/incomeUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const IncomeDetails = () => {
  const { incomes, loading, refetchIncomes } = useFinanceStore();

  /**
   * handleDelete: Removes income from Firebase using the document ID.
   * Logic: Points to users -> [userId] -> incomes -> [id]
   */
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

            // Call the unified service for deletion
            await FinanceService.deleteItem("incomes", user.uid, id);
            refetchIncomes(); // Sync the store
          } catch (error) {
            console.error("Deletion failed:", error);
            Alert.alert("Error", "Failed to delete income");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const totalIncome = useMemo(() => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  }, [incomes]);

  if (loading && incomes.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Income...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-rubik-semibold text-white">
            Income
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400">
            {incomes.length} {incomes.length === 1 ? "source" : "sources"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newIncome")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={36} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Total Summary Card */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between w-full bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
            <View className="flex-1">
              <Text className="font-rubik text-sm text-gray-400 uppercase tracking-widest">
                Total Income
              </Text>
              <Text className="font-rubik-semibold text-4xl py-2 text-white">
                ${totalIncome.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-sm text-gray-400">
                All sources combined
              </Text>
            </View>
            <View className="justify-center">
              <FontAwesome name="dollar" size={32} color="#10b981" />
            </View>
          </View>
        </View>

        <View className="px-5 mt-6 mb-3">
          <Text className="font-rubik-medium text-base text-gray-300">
            Your Income Sources
          </Text>
        </View>

        {/* List of Incomes */}
        <View className="px-5 mb-4">
          {incomes.map((income) => {
            // Logic: Calculate next pay using the startDate ISO string
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
                <View className="w-full bg-[#1a1a1a] border border-green-600/20 rounded-2xl mb-3 p-5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-rubik-semibold text-xl text-white">
                        {income.description}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Text className="font-rubik text-xs text-gray-400">
                          {income.frequency}
                        </Text>
                        <Text className="text-gray-600 mx-2">•</Text>
                        <Text className="font-rubik text-xs text-gray-400">
                          Next:{" "}
                          {nextPayDate
                            ? nextPayDate.toLocaleDateString("en-GB")
                            : "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-rubik-semibold text-2xl text-green-500 ml-3">
                      ${income.amount.toFixed(2)}
                    </Text>
                  </View>
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
