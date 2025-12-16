import SwipeableRow from "@/components/SwipeableRow";
import {
  deleteTransaction,
  fetchAllTransaction,
  Transaction,
} from "@/services/transaction";
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
import { useFocusEffect } from "@react-navigation/native";
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  const loadTransactions = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const transactionData = await fetchAllTransaction();
      setTransactions(transactionData);
    } catch (error) {
      console.error("Failed to fetch Transactions", error);
      Alert.alert("Error", "Failed to load Transactions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadTransactions();
      return () => {};
    }, [loadTransactions, refreshToggle])
  );

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
              setRefreshToggle((prev) => !prev);
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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
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
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* Header with title and add button */}
      <View className="px-5 pt-3 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-rubik-semibold">Transactions</Text>
          <Text className="text-xs font-rubik-light text-gray-700">
            {numOfTransaction} transactions
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newTransaction")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View>
          {/* Search Bar */}
          <View className="px-5 mt-3">
            <View className="flex-row items-center bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-base font-rubik"
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
          <View className="flex-row justify-evenly mt-3 px-5 gap-3">
            <View className="flex-1 bg-white rounded-xl shadow-md shadow-black/10 p-3">
              <Text className="font-rubik text-xs text-gray-700">
                TODAY'S SPENDING
              </Text>
              <Text className="font-rubik-semibold text-lg text-black py-2">
                ${todaysSpending.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-xs text-gray-700">
                • This week: ${weekTotal.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-white rounded-xl shadow-md shadow-black/10 p-3">
              <Text className="font-rubik text-xs text-gray-700">
                THIS MONTH
              </Text>
              <Text className="font-rubik-semibold text-lg text-black py-2">
                ${monthTotal.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-xs text-gray-700">
                • Avg: ${averagePerDay.toFixed(2)}/day
              </Text>
            </View>
          </View>

          <View className="items-start w-full px-5 mt-3 mb-6">
            {groupTransactionsByDate(transactions).map((group) => (
              <View key={group.date} className="w-full mb-4">
                {/* Date - shown once for all transactions on this date */}
                <Text className="font-rubik-medium text-sm text-black-300 mb-2">
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
                    <View className="bg-white rounded-2xl shadow-md shadow-black/10 p-3 w-full mb-2">
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="font-rubik text-base text-black">
                            {transaction.description}
                          </Text>
                          <Text className="text-xs font-rubik text-gray-700 mt-1">
                            {transaction.category}
                          </Text>
                        </View>
                        <Text className="font-rubik-semibold text-lg text-black ml-3">
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
