import { Bill, fetchAllBill } from "@/services/bill";
import {
  calculateBillTotal,
  getBillsDueCurrentMonth,
  getPaidBillsThisMonth,
  getUpcomingBills,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import { getCurrentWeekOfMonth, getWeekDateRange } from "@/utils/dateUtils";
import { calculateIncomeTotal, getWeeklyIncome } from "@/utils/incomeUtils";
import { formatMongoDate } from "@/utils/mongoDate";
import { calculateWeeklySpending } from "@/utils/transactionUtils";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFinanceStore } from "@/store/financeStore";

const index = () => {
    // Local state with global state and actions
    const {
      incomes,
      bills,
      transactions,
      loading,
      loadInitialData
    } = useFinanceStore();

  useFocusEffect(
    React.useCallback(() => {
      //This logic is now handled in the store, but we call it here to trigger the load
      loadInitialData()

      //  The return cleanup functions remains empty or as needed
      return () => {};

      // Dependency array only needs loadInitialData now 
    }, [loadInitialData])
  );

  // The rest of the component uses the global loading state
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <ActivityIndicator color="#ffd33d" size="large" />
      </View>
    );
  }

  const currentWeekOfMonth = getCurrentWeekOfMonth();
  const dateRange = getWeekDateRange();

  // Calculate weekly income (income due this week)
  const weeklyIncomes = getWeeklyIncome(incomes);
  const weeklyIncome = calculateIncomeTotal(weeklyIncomes);

  // Bills - get weekly savings plan
  const savingsPlan = getWeeklySavingsPlan(bills);
  const recommendedWeeklyBudget = savingsPlan.finalWeeklyTarget;
  const billsDueThisWeek = savingsPlan.billsDueThisWeekTotal;

  // Transactions - calculate weekly spending
  const weeklySpending = calculateWeeklySpending(transactions);

  // Hardcoded savings for now
  const weeklySavings = 0;

  // Calculate Total balance (income - bills - savings - spending)
  const totalBalance =
    weeklyIncome - billsDueThisWeek - weeklySavings - weeklySpending;

  // 1. Get paid bills
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);

  // 2. Get bills due this month
  const billsForCurrentMonthTotal = getBillsDueCurrentMonth(bills);

  // Filter current month bills to exclude paid bills
  const unpaidBillsThisMonth = billsForCurrentMonthTotal.filter(
    (bill) => !paidBillsThisMonth.some((paidBill) => paidBill._id === bill._id)
  );

  // Calculate total unpaid amount
  const totalUnpaidAmount = calculateBillTotal(unpaidBillsThisMonth);

  const unpaidCount = unpaidBillsThisMonth.length;
  const paidCount = paidBillsThisMonth.length;

  // Recent Transactions - get last 5 transactions (newest first, like banks)
  const recentTransactions = transactions
    .filter((t) => t.date) // Filter out transactions without dates
    .sort((a, b) => {
      const dateA = new Date(a.date!).getTime();
      const dateB = new Date(b.date!).getTime();

      // Sort descending: newer dates (bigger numbers) come first
      return dateB - dateA;
    })
    .slice(0, 5);


  // Upcoming Bills - get bills due in next 7 days
  const upcomingBills = getUpcomingBills(bills);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="bg-[#0a0a0a]">
        {/* Title BOX */}
        <View className="px-5 pt-4">
          <Text className="font-rubik-semibold text-2xl text-white">
            Good morning, Vidhu
          </Text>
          <Text className="text-sm font-rubik-light text-gray-400 mb-4">
            Here is your spending for this week
          </Text>
        </View>

        {/* Week Badge */}
        <View className="flex-row items-center px-5 mb-4">
          <Text className="font-rubik-medium text-base text-white">
            Week {currentWeekOfMonth}
          </Text>
          <Text className="font-rubik-light text-sm text-gray-400 ml-2">
            • {dateRange}
          </Text>
        </View>

        {/* Total Balance Card  */}
        <View className="mx-5 mb-5 bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 p-5">
          {/* Balance Section */}
          <Text className="font-rubik text-sm text-gray-400">
            Total Balance
          </Text>
          <Text className="font-rubik-semibold text-5xl text-white py-3">
            ${totalBalance.toFixed(2)}
          </Text>
          <Text className="font-rubik-light text-sm text-gray-400 mb-4">
            Available for spending this week
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="gap-3 px-5">
          {/* Row 1 */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-[#1a1a1a] rounded-xl p-4 border border-green-600/30">
              <Text className="font-rubik text-xs text-gray-400">
                Paid This Week
              </Text>
              <Text className="font-rubik-semibold text-xl text-green-500 pt-2">
                ${weeklyIncome.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-[#1a1a1a] rounded-xl p-4 border border-yellow-600/30">
              <Text className="font-rubik text-xs text-gray-400">
                Weekly Bill Target
              </Text>
              <Text className="font-rubik-semibold text-xl text-yellow-500 pt-2">
                ${recommendedWeeklyBudget.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Row 2 */}
          <View className="flex-row gap-3">
            <View className="flex-1 bg-[#1a1a1a] rounded-xl p-4 border border-blue-600/30">
              <Text className="font-rubik text-xs text-gray-400">Savings</Text>
              <Text className="font-rubik-semibold text-xl text-blue-500 pt-2">
                ${weeklySavings.toFixed(2)}
              </Text>
            </View>
            <View className="flex-1 bg-[#1a1a1a] rounded-xl p-4 border border-red-600/30">
              <Text className="font-rubik text-xs text-gray-400">
                Total Unpaid Bills
              </Text>
              <Text className="font-rubik-semibold text-xl text-red-500 pt-2">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="px-5 mt-6 mb-4">
          <Text className="font-rubik-semibold text-xl text-white mb-3">
            Recent Transactions
          </Text>
          {recentTransactions.map((transaction) => (
            <View
              key={transaction._id}
              className="bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 p-4 w-full mb-3"
            >
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
          ))}
        </View>

        {/* Upcoming Bills */}
        {upcomingBills.length > 0 && (
          <View className="px-5 mt-2 mb-6">
            <Text className="font-rubik-semibold text-xl text-white mb-3">
              Upcoming Bills ({upcomingBills.length})
            </Text>
            {upcomingBills.map((bill) => (
              <View
                key={bill._id}
                className="bg-[#1a1a1a] border border-orange-600/30 rounded-2xl shadow-md shadow-black/50 p-4 w-full mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="font-rubik-medium text-lg text-white">
                      {bill.description}
                    </Text>
                    <Text className="font-rubik-light text-sm text-gray-400 mt-1">
                      Due: {formatMongoDate(bill.startDate || "")}
                    </Text>
                  </View>
                  <Text className="font-rubik-semibold text-xl text-orange-500 ml-3">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
