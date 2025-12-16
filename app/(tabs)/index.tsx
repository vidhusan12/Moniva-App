import { Bill, fetchAllBill } from "@/services/bill";
import { calculateBillTotal } from "@/utils/billUtils";
import { getCurrentWeekOfMonth, getWeekDateRange } from "@/utils/dateUtils";
import { useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAllIncome, Income } from "../../services/income";

const index = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadIncomes = async () => {
        try {
          setLoading(true);
          const data = await fetchAllIncome();
          const billData = await fetchAllBill();
          setIncomes(data);
          setBills(billData);
        } finally {
          setLoading(false);
        }
      };
      loadIncomes();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  const currentWeekOfMonth = getCurrentWeekOfMonth();
  const dateRange = getWeekDateRange();

  function calculateWeeklyIncome() {
    let totalWeekly = 0;
    incomes.forEach((income) => {
      if (income.frequency === "Weekly") {
        totalWeekly += income.amount;
      }
    });

    return totalWeekly;
  }

  const weekylyIncome = calculateWeeklyIncome();

  // Bills
  const totalMonthlyBill = calculateBillTotal(bills);
  const recommendedWeeklyBudget = totalMonthlyBill / 4;
  const remainingBillsThisMonth = totalMonthlyBill - recommendedWeeklyBudget;

  // Calculate Total balance
  function calculateToalBalance() {
    const total = calculateWeeklyIncome();
    return total - recommendedWeeklyBudget;
  }

  return (
    <SafeAreaView>
      <ScrollView>
        {/* Title BOX */}
        <View className="px-5 pt-3">
          <Text className="font-rubik-semibold text-xl">
            Good morning, Vidhu
          </Text>
          <Text className="text-xs font-rubik-light text-gray-700 mb-3">
            Here is your spending for this week
          </Text>
        </View>

        {/* Week Badge */}
        <View className="flex-row items-center px-5 mb-3">
          <Text className="font-rubik-medium text-sm text-black">
            Week {currentWeekOfMonth}
          </Text>
          <Text className="font-rubik-light text-xs text-gray-700 ml-2">
            • {dateRange}
          </Text>
        </View>

        {/* Main Balance Card with Stats */}
        <View className="mx-5 mb-4 bg-white rounded-2xl shadow-md shadow-black/10 p-4">
          {/* Balance Section */}
          <Text className="font-rubik text-xs text-gray-700">
            Total Balance
          </Text>
          <Text className="font-rubik-semibold text-4xl text-black py-2">
            ${calculateToalBalance().toFixed(2)}
          </Text>
          <Text className="font-rubik-light text-xs text-gray-700 mb-4">
            Available for spending this week
          </Text>

          {/* Stats Grid */}
          <View className="gap-2">
            {/* Row 1 */}
            <View className="flex-row gap-2">
              <View className="flex-1 bg-green-50 rounded-xl p-3 border border-green-200">
                <Text className="font-rubik text-xs text-gray-700">
                  Paid This Week
                </Text>
                <Text className="font-rubik-semibold text-base text-green-600 pt-1">
                  ${weekylyIncome.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 bg-yellow-50 rounded-xl p-3 border border-yellow-200">
                <Text className="font-rubik text-xs text-gray-700">
                  For Bills
                </Text>
                <Text className="font-rubik-semibold text-base text-yellow-600 pt-1">
                  ${recommendedWeeklyBudget.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Row 2 */}
            <View className="flex-row gap-2">
              <View className="flex-1 bg-blue-50 rounded-xl p-3 border border-blue-200">
                <Text className="font-rubik text-xs text-gray-700">
                  For Savings
                </Text>
                <Text className="font-rubik-semibold text-base text-blue-600 pt-1">
                  $90.00
                </Text>
              </View>
              <View className="flex-1 bg-red-50 rounded-xl p-3 border border-red-200">
                <Text className="font-rubik text-xs text-gray-700">
                  Remaining Bills
                </Text>
                <Text className="font-rubik-semibold text-base text-red-600 pt-1">
                  ${remainingBillsThisMonth.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
