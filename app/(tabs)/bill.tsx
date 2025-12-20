import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase"; // 🛡️ Required for User ID
import { FinanceService } from "@/services/financeService"; // 🏆 Unified Service
import { useFinanceStore } from "@/store/financeStore";
import {
  calculateBillTotal,
  getBillsDueCurrentMonth,
  getMonthlyUpcomingBills,
  getPaidBillsThisMonth,
  getWeeklyBillSummary,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDisplayDate } from "../../utils/dateFormatting";

const BillDetails = () => {
  // Global state
  const { bills, loading, refetchBills } = useFinanceStore();

  /**
   * handleDelete: Removes a bill from Firebase.
   * Logic: Uses auth.currentUser.uid to find the correct folder.
   */
  const handleDelete = async (id?: string) => {
    if (!id) return;

    Alert.alert("Confirm Delete", "Permanently delete this bill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;
            // ☁️ Logic: Delete from Firebase
            await FinanceService.deleteItem("bills", user.uid, id);
            refetchBills(); // Refresh UI
          } catch (error) {
            Alert.alert("Error", "Failed to delete bill");
          }
        },
        style: "destructive",
      },
    ]);
  };

  /**
   * handleMarkPaid: Updates status in Firebase.
   */
  const handleMarkPaid = async (billId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const updateData = {
        status: "paid" as const,
        lastPaidDate: new Date().toISOString(),
      };

      await FinanceService.updateItem("bills", user.uid, billId, updateData);
      refetchBills();
    } catch (error) {
      Alert.alert("Error", "Failed to mark as paid");
    }
  };

  // --- Logic Filters (Refactored to use .id instead of ._id) ---

  const paidBillsThisMonth = useMemo(
    () => getPaidBillsThisMonth(bills),
    [bills]
  );

  const billsDueThisWeek = useMemo(
    () =>
      getWeeklyBillSummary(bills).filter(
        (weekBill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill.id === weekBill.id)
      ),
    [bills, paidBillsThisMonth]
  );

  const monthlyUpcomingBillsWithMeta = useMemo(
    () => getMonthlyUpcomingBills(bills),
    [bills]
  );

  const allUnpaidBills = useMemo(
    () =>
      monthlyUpcomingBillsWithMeta.filter(
        (upcomingBill) =>
          !paidBillsThisMonth.some(
            (paidBill) => paidBill.id === upcomingBill.id
          )
      ),
    [monthlyUpcomingBillsWithMeta, paidBillsThisMonth]
  );

  const { overdue, dueThisMonth } = useMemo(() => {
    const overdueBills = allUnpaidBills.filter((bill) => bill.isOverdue);
    const dueThisMonthBills = allUnpaidBills.filter((bill) => !bill.isOverdue);
    return { overdue: overdueBills, dueThisMonth: dueThisMonthBills };
  }, [allUnpaidBills]);

  const finalUnpaidDisplayList = useMemo(
    () => [...overdue, ...dueThisMonth],
    [overdue, dueThisMonth]
  );

  const unpaidBillsThisMonth = useMemo(
    () =>
      getBillsDueCurrentMonth(bills).filter(
        (bill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
      ),
    [bills, paidBillsThisMonth]
  );

  const totalUnpaidAmount = useMemo(
    () => calculateBillTotal(unpaidBillsThisMonth),
    [unpaidBillsThisMonth]
  );
  const weeklySavingsPlan = useMemo(() => getWeeklySavingsPlan(bills), [bills]);

  if (loading && bills.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Bills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header */}
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-rubik-semibold text-white">Bills</Text>
          <Text className="text-sm font-rubik-light text-gray-400">
            {unpaidBillsThisMonth.length} pending • {paidBillsThisMonth.length}{" "}
            paid
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={36} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Summary Card */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between w-full bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
            <View className="flex-1">
              <Text className="font-rubik text-sm text-gray-400 uppercase tracking-widest">
                Total Unpaid
              </Text>
              <Text className="font-rubik-semibold text-4xl py-2 text-white">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-sm text-gray-400">
                Due this month
              </Text>
            </View>
            <FontAwesome name="dollar" size={32} color="#ef233c" />
          </View>
        </View>

        {/* Weekly Target Card */}
        <View className="px-5 mt-4">
          <View className="bg-[#1a1a1a] border border-blue-600/30 rounded-2xl p-5">
            <Text className="font-rubik text-sm text-gray-400 uppercase tracking-widest">
              Weekly Target
            </Text>
            <Text className="font-rubik-semibold text-3xl py-2 text-blue-500">
              ${weeklySavingsPlan.finalWeeklyTarget.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* List: Due This Week */}
        {billsDueThisWeek.length > 0 && (
          <View className="px-5 mt-6">
            <Text className="text-gray-300 font-rubik-medium mb-3">
              Due This Week
            </Text>
            {billsDueThisWeek.map((bill) => (
              <View
                key={bill.id}
                className="bg-[#1a1a1a] border border-orange-600/20 rounded-2xl p-4 mb-3"
              >
                <View className="flex-row justify-between">
                  <Text className="text-white text-lg font-rubik">
                    {bill.description}
                  </Text>
                  <Text className="text-orange-500 font-rubik-semibold">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* List: Upcoming/Overdue */}
        <View className="px-5 mt-6">
          <Text className="text-gray-300 font-rubik-medium mb-3">Upcoming</Text>
          {finalUnpaidDisplayList.map((bill) => (
            <SwipeableRow
              key={bill.id}
              onSwipeLeft={() => handleDelete(bill.id)}
              onSwipeRight={() =>
                router.push({ pathname: "/newBill", params: { id: bill.id } })
              }
            >
              <View
                className={`bg-[#1a1a1a] rounded-2xl p-4 mb-2 border ${bill.isOverdue ? "border-red-600/40" : "border-white/5"}`}
              >
                <View className="flex-row justify-between">
                  <View>
                    <Text className="text-white text-lg font-rubik-medium">
                      {bill.description}
                    </Text>
                    <Text className="text-gray-400 text-xs mt-1">
                      Due: {formatDisplayDate(bill.startDate)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleMarkPaid(bill.id!)}
                    className="bg-green-600 px-4 py-2 rounded-xl"
                  >
                    <Text className="text-white font-rubik-medium">
                      ${bill.amount.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
