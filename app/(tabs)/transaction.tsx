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
} from "@/utils/transactionUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TransactionList = () => {
  // GLOBAL STATE & HOOKS

  // accessing the "pantry" of data (transactions) and the tools to refresh them.
  const { transactions, loading, refetchTransactions } = useFinanceStore();

  // Local state for the search bar text
  const [searchQuery, setSearchQuery] = useState("");

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
  };

  //  DELETE LOGIC

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
            // Communicate with Firebase to remove the item
            await FinanceService.deleteItem("transactions", user.uid, id);
            // Refresh the local list so the UI updates instantly
            refetchTransactions();
          } catch (error) {
            Alert.alert("Error", "Failed to delete transaction");
          }
        },
        style: "destructive",
      },
    ]);
  };

  // GROUPING LOGIC (THE FIX)
  // We use useMemo so this math only runs when 'transactions' change.
  // This fixes the issue where multiple "Today" headers appeared.
  const groupedTransactions = useMemo(() => {
    // A. Filter first (if user is searching)
    const filtered = transactions.filter(
      (t) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // B. Group by "YYYY-MM-DD"
    const groups: { [key: string]: typeof transactions } = {};

    filtered.forEach((transaction) => {
      // We take only the first 10 characters (2023-10-25) to ignore the time
      const dateKey = transaction.date.substring(0, 10);

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
    });

    // C. Convert to an array and sort by newest date first
    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((date) => ({
        date,
        transactions: groups[date], // List of items for this specific day
      }));
  }, [transactions, searchQuery]);

  //  MATH & STATS
  // Recalculating totals whenever the transaction list changes
  const monthTotal = calculateMonthlySpending(transactions);
  const averagePerDay = calculateAverageDailySpending(transactions);
  const todaysSpending = calculateTodaySpending(transactions);
  const weekTotal = calculateWeeklySpending(transactions);
  const numOfTransaction = calculateTransactionTotal(transactions);

  // RENDER UI

  // Loading Screen
  if (loading && transactions.length === 0) {
    return (
      <SafeAreaView
        className={`flex-1 items-center justify-center ${retro.bg}`}
      >
        <ActivityIndicator color="#2EC4B6" size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* HEADER SECTION */}
      <View className="px-6 pt-4 flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-3xl font-rubik-bold text-black tracking-tight uppercase">
            Transactions
          </Text>
          <Text className="text-sm font-rubik-bold text-gray-500 mt-1 uppercase tracking-wide">
            {numOfTransaction} Entries • History
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newTransaction")}
          className="w-12 h-12 bg-[#FFD93D] rounded-full items-center justify-center border-2 border-black"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={28} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* SEARCH BAR */}
        <View className="px-6 mt-2 mb-6">
          <View
            className={`flex-row items-center ${retro.card} px-4 py-3`}
            style={retro.btnShadow}
          >
            <Ionicons name="search" size={20} color="black" />
            <TextInput
              className="flex-1 ml-3 text-base font-rubik-bold text-black"
              placeholder="Search history..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
        </View>

        {/* INSIGHT CARDS (Stats) */}
        <View className="flex-row px-6 gap-3 mb-8">
          {/* Card 1: Today's Spending */}
          <View className={`flex-1 ${retro.card} p-4`} style={retro.btnShadow}>
            <View className="w-10 h-10 bg-[#FF9F1C] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="sunny" size={20} color="black" />
            </View>
            <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              Spent Today
            </Text>
            <Text className="font-rubik-bold text-2xl text-black">
              ${todaysSpending.toFixed(2)}
            </Text>
            <Text className="font-rubik-bold text-[10px] text-gray-500 mt-1">
              Weekly: ${weekTotal.toFixed(0)}
            </Text>
          </View>

          {/* Card 2: Monthly Spending */}
          <View className={`flex-1 ${retro.card} p-4`} style={retro.btnShadow}>
            <View className="w-10 h-10 bg-[#2EC4B6] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="calendar" size={20} color="black" />
            </View>
            <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
              This Month
            </Text>
            <Text className="font-rubik-bold text-2xl text-black">
              ${monthTotal.toFixed(2)}
            </Text>
            <Text className="font-rubik-bold text-[10px] text-gray-500 mt-1">
              ~${averagePerDay.toFixed(0)} / day
            </Text>
          </View>
        </View>

        {/* LIST OF TRANSACTIONS */}
        <View className="px-6 pb-20">
          {groupedTransactions.map((group) => (
            <View key={group.date} className="w-full mb-6">
              {/* DATE HEADER (e.g., "Today", "Yesterday", "Oct 24") */}
              <Text className="font-rubik-bold text-xs text-gray-500 uppercase mb-3 px-1 tracking-widest">
                {formatFriendlyDate(group.date)}
              </Text>

              {/* TRANSACTIONS FOR THIS DATE */}
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
                  <View
                    className={`${retro.card} p-4 w-full mb-3`}
                    style={retro.shadow}
                  >
                    <View className="flex-row justify-between items-center">
                      <View className="flex-1 flex-row items-center gap-3">
                        {/* Icon Box */}
                        <View className="w-10 h-10 bg-[#FFD93D] border-2 border-black rounded-lg items-center justify-center">
                          <Ionicons
                            name="receipt-outline"
                            size={18}
                            color="black"
                          />
                        </View>
                        <View>
                          <Text className="font-rubik-bold text-base text-black">
                            {item.description}
                          </Text>
                          <Text className="text-xs font-rubik-bold text-gray-500 mt-0.5 uppercase">
                            {item.category}
                          </Text>
                        </View>
                      </View>
                      <Text className="font-rubik-bold text-lg text-black ml-3">
                        -${item.amount.toFixed(2)}
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

export default TransactionList;
