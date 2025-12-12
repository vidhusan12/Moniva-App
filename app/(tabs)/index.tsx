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
        <View className="px-4 pt-3">
          <Text className="font-rubik-bold text-2xl">Good morning, Vidhu</Text>
          <Text className="text-base font-rubik-light text-gray-700 mb-4">
            Here is your spending for this week
          </Text>
        </View>

        {/* Current Week Box */}
        <View className=" w-2/6 ml-5 bg-white rounded-full p-2  border border-gray-200 mb-4">
          <Text className="text-center font-rubik mb-1">This Week</Text>
          <Text className=" text-center font-rubik-light text-sm text-gray-700">
            {dateRange}
          </Text>
        </View>

        {/* The Main Card Box */}
        <View className="py-4 px-4 bg-[#4361ee] mx-3 rounded-xl">
          <View className="flex-row justify-between ">
            <Text className="font-rubik text-[#edf6f9] text-lg">
              This Week balance
            </Text>
            <Text className="font-rubik text-[#edf6f9] text-lg">
              Week {currentWeekOfMonth}
            </Text>
          </View>
          {/* Balance Box */}
          <View className="mt-4">
            <Text className="font-rubik text-[#edf6f9] text-base">
              Total balance
            </Text>
            <Text className="font-rubik-medium text-[#edf6f9] text-2xl">
              ${calculateToalBalance().toFixed(2)}
            </Text>
            <Text className="font-rubik text-[#edf6f9] text-sm mt-5">
              This is everything you have across your accounts right now.
            </Text>
          </View>
          {/* Income Information Box */}
          <View className="flex-row justify-between mt-4">
            {/* LEFT Column */}
            <View className="flex-1">
              <Text className="font-rubik text-[#edf6f9] text-sm">
                Paid this week
              </Text>
              <Text className="font-rubik-medium text-[#70e000] text-lg mb-3">
                ${weekylyIncome}
              </Text>
              <Text className="font-rubik text-[#edf6f9] text-sm">
                Put aside for bills
              </Text>
              <Text className="font-rubik-medium text-[#ffd000] text-lg mb-3">
                ${recommendedWeeklyBudget.toFixed(2)}
              </Text>
            </View>
            {/* RIGHT Column */}
            <View>
              <Text className="font-rubik text-[#edf6f9] text-sm">
                Put aside for savings
              </Text>
              <Text className="font-rubik-medium text-[#80b918] text-lg mb-3">
                $90.00
              </Text>
              <Text className="font-rubik text-[#edf6f9] text-sm">
                Remaining Bills this Month
              </Text>
              <Text className="font-rubik-medium text-[#e5383b] text-lg mb-3">
                ${remainingBillsThisMonth.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default index;
