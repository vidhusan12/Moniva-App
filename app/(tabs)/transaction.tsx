import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { formatFriendlyDate } from "@/utils/dateFormatting";
import {
  calculateAverageDailySpending,
  calculateMonthlySpending,
  calculateTodaySpending,
  calculateTransactionTotal,
  calculateWeeklySpending,
  groupTransactionsByDate,
} from "@/utils/transactionUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const transaction = () => {
  const { transactions, loading, refetchTransactions } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert("Confirm Delete", "Permanently delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;
            await FinanceService.deleteItem("transactions", user.uid, id);
            refetchTransactions();
          } catch (error) {
            Alert.alert("Error", "Failed to delete transaction");
          }
        },
        style: "destructive",
      },
    ]);
  };

  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Transactions...</Text>
      </SafeAreaView>
    );
  }

  // Summary Calculations
  const monthTotal = calculateMonthlySpending(transactions);
  const averagePerDay = calculateAverageDailySpending(transactions);
  const todaysSpending = calculateTodaySpending(transactions);
  const weekTotal = calculateWeeklySpending(transactions);
  const numOfTransaction = calculateTransactionTotal(transactions);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-rubik-semibold text-white">
            Transactions
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400">
            {numOfTransaction} transactions
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newTransaction")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={36} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Search Bar - Logic removed as requested */}
        <View className="px-5 mt-4">
          <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-white/5">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-3 text-base font-rubik text-white"
              placeholder="Search history"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666"
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View className="flex-row justify-evenly mt-4 px-5 gap-3">
          <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <Text className="font-rubik text-[10px] text-gray-400 uppercase tracking-tighter">
              Today
            </Text>
            <Text className="font-rubik-semibold text-xl text-white py-1">
              ${todaysSpending.toFixed(2)}
            </Text>
            <Text className="font-rubik-light text-[10px] text-gray-500">
              Weekly: ${weekTotal.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-[#1a1a1a] rounded-2xl p-4 border border-white/5">
            <Text className="font-rubik text-[10px] text-gray-400 uppercase tracking-tighter">
              This Month
            </Text>
            <Text className="font-rubik-semibold text-xl text-white py-1">
              ${monthTotal.toFixed(2)}
            </Text>
            <Text className="font-rubik-light text-[10px] text-gray-500">
              Avg: ${averagePerDay.toFixed(2)}/day
            </Text>
          </View>
        </View>

        {/* List */}
        <View className="px-5 mt-6 mb-10">
          {groupTransactionsByDate(transactions).map((group) => (
            <View key={group.date} className="w-full mb-6">
              <Text className="font-rubik-medium text-xs text-gray-500 uppercase mb-3 px-1">
                {formatFriendlyDate(group.date)}
              </Text>

              {group.transactions.map((item) => (
                <SwipeableRow
                  key={item.id}
                  onSwipeLeft={() => handleDelete(item.id)}
                  onSwipeRight={() =>
                    router.push({
                      pathname: "/newTransaction",
                      params: { id: item.id },
                    })
                  }
                >
                  <View className="bg-[#1a1a1a] rounded-2xl p-4 w-full mb-2 border border-white/5">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1">
                        <Text className="font-rubik-medium text-base text-white">
                          {item.description}
                        </Text>
                        <Text className="text-xs font-rubik text-gray-500 mt-1">
                          {item.category}
                        </Text>
                      </View>
                      <Text className="font-rubik-semibold text-lg text-white ml-3">
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </SwipeableRow>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default transaction;
