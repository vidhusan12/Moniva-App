import { useFinanceStore } from "@/store/financeStore";
import {
  calculateBillTotal,
  getBillsDueCurrentMonth,
  getPaidBillsThisMonth,
  getUpcomingBills,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import { formatDisplayDate } from "@/utils/dateFormatting"; // 🏆 Updated import
import { getCurrentWeekOfMonth, getWeekDateRange } from "@/utils/dateUtils";
import { calculateIncomeTotal, getWeeklyIncome } from "@/utils/incomeUtils";
import { calculateWeeklySpending } from "@/utils/transactionUtils";
import { Redirect, useFocusEffect } from "expo-router";
import React from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {

  // 1️⃣ Access Global State
  // Why: We use Zustand so that data is shared across all tabs instantly.
  const { incomes, bills, transactions, loading, loadInitialData } =
    useFinanceStore();


  // 3️⃣ Loading State
  // Logic: Only show the spinner if we have NO data yet.
  // If we have data, we let the background refresh happen silently.
  if (loading && bills.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <ActivityIndicator color="#ffd33d" size="large" />
      </View>
    );
  }

  // --- 📊 MATH & DATA PROCESSING ---

  // Date Logic
  const currentWeekOfMonth = getCurrentWeekOfMonth();
  const dateRange = getWeekDateRange();

  // Income Logic: Converts monthly/fortnightly income into a "This Week" value.
  const weeklyIncomes = getWeeklyIncome(incomes);
  const weeklyIncome = calculateIncomeTotal(weeklyIncomes);

  // Bill Logic: Identifies how much you need to set aside this week for future bills.
  const savingsPlan = getWeeklySavingsPlan(bills);
  const recommendedWeeklyBudget = savingsPlan.finalWeeklyTarget;
  const billsDueThisWeek = savingsPlan.billsDueThisWeekTotal;

  // Spending Logic: Sums up all transactions that happened in the last 7 days.
  const weeklySpending = calculateWeeklySpending(transactions);
  const weeklySavings = 0; // Future feature: automated savings goals.

  // 🏆 The Master Calculation: The money you actually have left to spend right now.
  const totalBalance =
    weeklyIncome - billsDueThisWeek - weeklySavings - weeklySpending;

  // Unpaid Bills Logic: Filter by 'id' to find bills that haven't been marked paid.
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);
  const billsForCurrentMonthTotal = getBillsDueCurrentMonth(bills);
  const unpaidBillsThisMonth = billsForCurrentMonthTotal.filter(
    (bill) => !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
  );
  const totalUnpaidAmount = calculateBillTotal(unpaidBillsThisMonth);

  // Recent Transactions: Sort by date string and take the top 5.
  const recentTransactions = [...transactions]
    .filter((t) => t.date)
    .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
    .slice(0, 5);

  const upcomingBills = getUpcomingBills(bills);

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView className="bg-[#0a0a0a]">
        {/* Header Section */}
        <View className="px-5 pt-4">
          <Text className="font-rubik-semibold text-2xl text-white">
            Good morning, Vidhu
          </Text>
          <View className="flex-row items-center mt-1 mb-4">
            <Text className="font-rubik-medium text-sm text-gray-400">
              Week {currentWeekOfMonth}
            </Text>
            <Text className="text-gray-600 mx-2">•</Text>
            <Text className="font-rubik-light text-sm text-gray-500">
              {dateRange}
            </Text>
          </View>
        </View>

        {/* Total Balance Card */}
        <View className="mx-5 mb-5 bg-[#1a1a1a] rounded-3xl p-6 border border-white/5">
          <Text className="font-rubik text-xs text-gray-500 uppercase tracking-widest">
            Available Balance
          </Text>
          <Text className="font-rubik-semibold text-5xl text-white py-3">
            ${totalBalance.toFixed(2)}
          </Text>
          <Text className="font-rubik-light text-xs text-gray-400">
            Ready to spend this week
          </Text>
        </View>

        {/* Stats Grid: 2x2 Layout */}
        <View className="px-5 flex-row flex-wrap justify-between">
          {/* Income Box */}
          <View className="w-[48%] bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-green-600/20">
            <Text className="text-[10px] text-gray-500 uppercase font-rubik-medium">
              Weekly Income
            </Text>
            <Text className="text-lg font-rubik-semibold text-green-500 mt-1">
              ${weeklyIncome.toFixed(2)}
            </Text>
          </View>
          {/* Bill Target Box */}
          <View className="w-[48%] bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-yellow-600/20">
            <Text className="text-[10px] text-gray-500 uppercase font-rubik-medium">
              Bill Target
            </Text>
            <Text className="text-lg font-rubik-semibold text-yellow-500 mt-1">
              ${recommendedWeeklyBudget.toFixed(2)}
            </Text>
          </View>
          {/* Savings Box */}
          <View className="w-[48%] bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-blue-600/20">
            <Text className="text-[10px] text-gray-500 uppercase font-rubik-medium">
              Savings
            </Text>
            <Text className="text-lg font-rubik-semibold text-blue-500 mt-1">
              ${weeklySavings.toFixed(2)}
            </Text>
          </View>
          {/* Unpaid Bills Box */}
          <View className="w-[48%] bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-red-600/20">
            <Text className="text-[10px] text-gray-500 uppercase font-rubik-medium">
              Unpaid Bills
            </Text>
            <Text className="text-lg font-rubik-semibold text-red-500 mt-1">
              ${totalUnpaidAmount.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Recent Transactions Section */}
        <View className="px-5 mt-6 mb-4">
          <Text className="font-rubik-semibold text-xl text-white mb-3">
            Recent Spending
          </Text>
          {recentTransactions.map((t) => (
            <View
              key={t.id}
              className="bg-[#1a1a1a] rounded-2xl p-4 w-full mb-3 border border-white/5"
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-rubik text-base text-white">
                    {t.description}
                  </Text>
                  <Text className="text-xs font-rubik text-gray-500 mt-1">
                    {t.category}
                  </Text>
                </View>
                <Text className="font-rubik-semibold text-lg text-white">
                  ${t.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Upcoming Bills Section */}
        {upcomingBills.length > 0 && (
          <View className="px-5 mt-2 mb-10">
            <Text className="font-rubik-semibold text-xl text-white mb-3">
              Upcoming Bills
            </Text>
            {upcomingBills.map((bill) => (
              <View
                key={bill.id}
                className="bg-[#1a1a1a] border border-orange-600/20 rounded-2xl p-4 w-full mb-3"
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-rubik-medium text-base text-white">
                      {bill.description}
                    </Text>
                    <Text className="text-xs text-orange-400 mt-1">
                      Due: {formatDisplayDate(bill.startDate)}
                    </Text>
                  </View>
                  <Text className="font-rubik-semibold text-lg text-white">
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

export default Dashboard;
