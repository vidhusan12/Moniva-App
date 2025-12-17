import SwipeableRow from "@/components/SwipeableRow";
import { useFinanceStore } from "@/store/financeStore";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteIncome } from "../../services/income";
import { calculateNextPayDate } from "../../utils/incomeUtils";
import { formatMongoDate } from "../../utils/mongoDate";

const IncomeDetails = () => {
  // Global state and refetch actions
  const { incomes, loading, refetchIncomes } = useFinanceStore();

  // 5. Function to format the Date object for display (same as before)
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      Alert.alert("Error", "No ID provided");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this income permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteIncome(id);
              refetchIncomes();
            } catch (error) {
              console.error("Deletion failed:", error);
              Alert.alert("Error", "Failed to delete income");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Calculate total income
  const totalIncome = useMemo(() => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  }, [incomes]);

  // 🏆 Use global loading state (this will show loading only during the initial app load)
  if (loading && incomes.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header and Add Button */}
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
        {/* Summary card: total income */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between w-full bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 p-5">
            <View className="flex-1">
              <Text className="font-rubik text-sm text-gray-400">
                TOTAL INCOME
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

        {/* Section header: Your Income Sources */}
        <View className="px-5 mt-5 mb-3">
          <Text className="font-rubik-medium text-base text-gray-300">
            Your Income Sources ({incomes.length})
          </Text>
        </View>

        {/* List of income sources with swipe */}
        <View className="px-5 mb-4">
          {incomes.map((income) => {
            // Calculate the next pay date
            const nextPayDate = income.startDate
              ? calculateNextPayDate(income.startDate, income.frequency)
              : null;
            const nextPayDateString = nextPayDate
              ? formatDateForDisplay(nextPayDate)
              : "N/A";

            return (
              <SwipeableRow
                key={income._id}
                onSwipeLeft={() => handleDelete(income._id)}
                onSwipeRight={() =>
                  router.push({
                    pathname: "/newIncome",
                    params: { id: income._id },
                  })
                }
              >
                <View className="w-full bg-[#1a1a1a] border border-green-600/30 rounded-2xl shadow-md shadow-black/50 mb-3 p-5">
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="font-rubik-semibold text-xl text-white">
                        {income.description}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <Text className="font-rubik text-sm text-gray-400">
                          {income.frequency}
                        </Text>
                        <Text className="font-rubik text-sm text-gray-400 mx-1">
                          •
                        </Text>
                        <Text className="font-rubik text-sm text-gray-400">
                          Last: {formatMongoDate(income.originalDueDate || "")}
                        </Text>
                        <Text className="font-rubik text-sm text-gray-400 mx-1">
                          •
                        </Text>
                        <Text className="font-rubik text-sm text-gray-400">
                          Next: {nextPayDateString}
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
