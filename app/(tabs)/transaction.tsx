import SwipeableRow from "@/components/SwipeableRow";
import { deleteTransaction } from "@/services/transaction";
import { useFinanceStore } from "@/store/financeStore";
import { formatFriendlyDate } from "@/utils/mongoDate";
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
  // Global state with actions
  const { transactions, loading, refetchTransactions } = useFinanceStore();
  const [searchQuery, setSearchQuery] = useState("");
  // ❌ The 'isLoading' local state is now unnecessary for data loading but can stay for search/UI loading
  const [isUiLoading, setIsUiLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const handleDelete = async (id?: string) => {
    if (!id) {
      Alert.alert("Error", "No ID Provided");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this transaction permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteTransaction(id);
              refetchTransactions();
            } catch (error) {
              console.error("Deletion failed:", error);
              Alert.alert("Error", "Failed to delete transaction");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  //  Use the global loading state for initial load visibility
  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Transactions...</Text>
      </SafeAreaView>
    );
  }

  // Total This Month
  const monthTotal = calculateMonthlySpending(transactions);
  const averagePerDay = calculateAverageDailySpending(transactions);
  const todaysSpending = calculateTodaySpending(transactions);
  const weekTotal = calculateWeeklySpending(transactions);
  const numOfTransaction = calculateTransactionTotal(transactions);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header with title and add button */}
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
        <View>
          {/* Search Bar */}
          <View className="px-5 mt-4">
            <View className="flex-row items-center bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 px-4 py-4">
              <Ionicons name="search" size={22} color="#999" />
              <TextInput
                className="flex-1 ml-3 text-base font-rubik text-white"
                placeholder="Search transactions"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* Spending Month box */}
          <View className="flex-row justify-evenly mt-4 px-5 gap-3">
            <View className="flex-1 bg-[#1a1a1a] rounded-xl shadow-md shadow-black/50 p-4">
              <Text className="font-rubik text-xs text-gray-400">
                TODAY'S SPENDING
              </Text>
              <Text className="font-rubik-semibold text-xl text-white py-2">
                ${todaysSpending.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-sm text-gray-400">
                • This week: ${weekTotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-[#1a1a1a] rounded-xl shadow-md shadow-black/50 p-4">
              <Text className="font-rubik text-xs text-gray-400">
                THIS MONTH
              </Text>
              <Text className="font-rubik-semibold text-xl text-white py-2">
                ${monthTotal.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-sm text-gray-400">
                • Avg: ${averagePerDay.toFixed(2)}/day
              </Text>
            </View>
          </View>

          <View className="items-start w-full px-5 mt-4 mb-6">
            {groupTransactionsByDate(transactions).map((group) => (
              <View key={group.date} className="w-full mb-4">
                {/* Date - shown once for all transactions on this date */}
                <Text className="font-rubik-medium text-base text-gray-300 mb-3">
                  {formatFriendlyDate(group.date)}
                </Text>

                {/* All transactions for this date */}
                {group.transactions.map((transaction) => (
                  <SwipeableRow
                    key={transaction._id}
                    onSwipeLeft={() => handleDelete(transaction._id)}
                    onSwipeRight={() =>
                      router.push({
                        pathname: "/newTransaction",
                        params: { id: transaction._id },
                      })
                    }
                  >
                    <View className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 p-4 w-full mb-2">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="font-rubik text-lg text-white">
                            {transaction.description}
                          </Text>
                          <Text className="text-sm font-rubik text-gray-400 mt-1">
                            {transaction.category}
                          </Text>
                        </View>
                        <Text className="font-rubik-semibold text-xl text-white ml-3">
                          ${transaction.amount}
                        </Text>
                      </View>
                    </View>
                  </SwipeableRow>
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default transaction;
