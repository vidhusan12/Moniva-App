import SwipeableRow from "@/components/SwipeableRow";
import { deleteBill, updateBill } from "@/services/bill";
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
import { formatDateForMongo, formatMongoDate } from "../../utils/mongoDate";

const BillDetails = () => {
  // Global state
  const { bills, loading, refetchBills } = useFinanceStore();

  /**
   * Deletes a bill after user confirmation.
   */
  const handleDelete = async (id?: string) => {
    if (!id) {
      Alert.alert("Error", "No ID Provided");
      return;
    }

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this bill permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteBill(id);
              refetchBills();
            } catch (error) {
              console.error("Deletion failed:", error);
              Alert.alert("Error", "Failed to delete bill");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  /**
   * Marks a bill as paid.
   */
  const handleMarkPaid = async (billId: string) => {
    try {
      // Logic for marking paid
      const updateData = { lastPaidDate: formatDateForMongo(new Date()) };
      await updateBill(billId, updateData);

      // call global refetch
      refetchBills();
      Alert.alert("Success", "Bill marked as paid.");
    } catch (error) {
      console.error("Payment failed:", error);
      Alert.alert("Error", "Failed to mark bill as paid.");
    }
  };

  /**
   * Marks a bill as unpaid (reverts payment).
   */
  const handleMarkUnpaid = async (billId: string) => {
    try {
      const updateData = { lastPaidDate: "" };
      await updateBill(billId, updateData);

      refetchBills();
      Alert.alert("Success", "Bill marked as unpaid");
    } catch (error) {
      console.error("Failed to mark bill as unpaid:", error);
      Alert.alert("Error", "Failed to update bill");
    }
  };

  // --- Calculations and Filtering (using useMemo for performance) ---
  const paidBillsThisMonth = useMemo(
    () => getPaidBillsThisMonth(bills),
    [bills]
  );

  const monthlyUpcomingBillsWithMeta = useMemo(
    () => getMonthlyUpcomingBills(bills),
    [bills]
  );

  const billsForCurrentMonthTotal = useMemo(
    () => getBillsDueCurrentMonth(bills),
    [bills]
  );

  const billsDueThisWeek = useMemo(
    () =>
      getWeeklyBillSummary(bills).filter(
        (weekBill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill._id === weekBill._id)
      ),
    [bills, paidBillsThisMonth]
  );

  const weeklySavingsPlan = useMemo(() => getWeeklySavingsPlan(bills), [bills]);

  // Filter out already-paid bills from the upcoming list
  const allUnpaidBills = useMemo(
    () =>
      monthlyUpcomingBillsWithMeta.filter(
        (upcomingBill) =>
          !paidBillsThisMonth.some(
            (paidBill) => paidBill._id === upcomingBill._id
          )
      ),
    [monthlyUpcomingBillsWithMeta, paidBillsThisMonth]
  );

  // Separate unpaid bills by overdue status
  const { overdue, dueThisMonth } = useMemo(() => {
    const overdueBills = allUnpaidBills.filter((bill) => bill.isOverdue);
    const dueThisMonthBills = allUnpaidBills.filter((bill) => !bill.isOverdue);
    return { overdue: overdueBills, dueThisMonth: dueThisMonthBills };
  }, [allUnpaidBills]);

  // Final list for display
  const finalUnpaidDisplayList = useMemo(
    () => [...overdue, ...dueThisMonth],
    [overdue, dueThisMonth]
  );

  // Filter current month bills to exclude paid bills
  const unpaidBillsThisMonth = useMemo(
    () =>
      billsForCurrentMonthTotal.filter(
        (bill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill._id === bill._id)
      ),
    [billsForCurrentMonthTotal, paidBillsThisMonth]
  );

  // Calculate totals and counts
  const totalUnpaidAmount = useMemo(
    () => calculateBillTotal(unpaidBillsThisMonth),
    [unpaidBillsThisMonth]
  );

  const unpaidCount = unpaidBillsThisMonth.length;
  const paidCount = paidBillsThisMonth.length;
  // --- End Calculations ---

  // Use the global loading state (this will show loading only during the initial app load)
  if (loading && bills.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Bills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      {/* Header with title and add button */}
      <View className="px-5 pt-5 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-rubik-semibold text-white">Bills</Text>
          <Text className="text-sm font-rubik-light text-gray-400">
            {unpaidCount} pending • {paidCount} paid
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
        {/* Summary card: total unpaid bills and stats */}
        <View className="px-5 mt-4">
          <View className="flex-row justify-between w-full bg-[#1a1a1a] rounded-2xl shadow-md shadow-black/50 p-5">
            <View className="flex-1">
              <Text className="font-rubik text-sm text-gray-400">
                TOTAL UNPAID
              </Text>
              <Text className="font-rubik-semibold text-4xl py-2 text-white">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-sm text-gray-400">
                Due this month
              </Text>
            </View>
            <View className="justify-center">
              <FontAwesome name="dollar" size={32} color="#ef233c" />
            </View>
          </View>
        </View>

        {/* Weekly Savings Plan Card */}
        <View className="px-5 mt-4">
          <View className="w-full bg-[#1a1a1a] border border-blue-600/30 rounded-2xl shadow-md shadow-black/50 p-5">
            <Text className="font-rubik text-sm text-gray-400">
              WEEKLY SAVINGS TARGET
            </Text>
            <Text className="font-rubik-semibold text-3xl py-2 text-blue-500">
              ${weeklySavingsPlan.finalWeeklyTarget.toFixed(2)}
            </Text>
            <Text className="font-rubik-light text-sm text-gray-400">
              Due this week: $
              {weeklySavingsPlan.billsDueThisWeekTotal.toFixed(2)} • Buffer: $
              {weeklySavingsPlan.futureBufferContribution.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Bills Due This Week Section */}
        {billsDueThisWeek.length > 0 && (
          <>
            <View className="px-5 mt-5 mb-3">
              <Text className="font-rubik-medium text-base text-gray-300">
                Due This Week ({billsDueThisWeek.length})
              </Text>
            </View>

            <View className="px-5 mb-4">
              {billsDueThisWeek.map((bill) => (
                <View
                  key={bill._id}
                  className="w-full bg-[#1a1a1a] border border-orange-600/30 rounded-2xl shadow-md shadow-black/50 mb-3 p-4"
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
                    <Text className="font-rubik-semibold text-xl text-orange-600 ml-2">
                      ${bill.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Section header: Upcoming Bills */}
        <View className="px-5 mt-5 mb-3">
          <Text className="font-rubik-medium text-base text-gray-300">
            Upcoming Bills ({unpaidCount})
          </Text>
        </View>

        {/* List of unpaid bills */}
        <View className="px-5 mb-4">
          {finalUnpaidDisplayList.map((bill) => (
            <SwipeableRow
              key={bill._id}
              onSwipeLeft={() => handleDelete(bill._id)}
              onSwipeRight={() =>
                router.push({
                  pathname: "/newBill",
                  params: { id: bill._id },
                })
              }
            >
              <View
                className={`w-full rounded-2xl shadow-md shadow-black/50 mb-2 ${
                  bill.isOverdue
                    ? "bg-[#1a1a1a] border border-red-600/50"
                    : "bg-[#1a1a1a] border border-gray-700/30"
                }`}
              >
                <View className="flex-row justify-between p-4">
                  <View className="flex-1">
                    <Text className="font-rubik-medium text-lg text-white">
                      {bill.description}
                    </Text>
                    <View className="flex-row gap-2 items-center pt-2">
                      <Text className="bg-gray-700 rounded-md font-rubik-light text-xs text-gray-300 px-2 py-1">
                        {bill.frequency}
                      </Text>
                      {bill.isOverdue ? (
                        <Text className="font-rubik-semibold text-sm text-red-500">
                          Overdue: Pay Now!
                        </Text>
                      ) : (
                        <Text className="font-rubik-light text-sm text-gray-400">
                          Due: {formatMongoDate(bill.startDate || "")}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="justify-center ml-3 items-end">
                    <Text className="font-rubik-semibold text-xl text-red-500">
                      ${bill.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(bill._id!)}
                      className="flex-row items-center gap-1 bg-green-500 px-4 py-2 rounded-full mt-2"
                    >
                      <Ionicons name="checkmark" size={14} color="white" />
                      <Text className="font-rubik-medium text-sm text-white">
                        Mark Paid
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </View>

        {/* Section header: Paid Bills */}
        <View className="px-5 mt-5 mb-3">
          <Text className="font-rubik-medium text-base text-gray-300">
            Paid This Month ({paidCount})
          </Text>
        </View>

        {/* List of paid bills */}
        <View className="px-5 mb-6">
          {paidBillsThisMonth.map((bill) => (
            <SwipeableRow
              key={bill._id}
              onSwipeLeft={() => handleDelete(bill._id)}
              onSwipeRight={() =>
                router.push({
                  pathname: "/newBill",
                  params: { id: bill._id },
                })
              }
            >
              <View className="w-full bg-[#1a1a1a] border border-green-600/30 rounded-2xl shadow-md shadow-black/50 mb-2 opacity-80">
                <View className="flex-row justify-between p-4">
                  <View className="flex-1">
                    <Text className="font-rubik-medium text-lg text-gray-500 line-through">
                      {bill.description}
                    </Text>
                    <View className="flex-row gap-2 items-center pt-2">
                      <Text className="bg-green-700 rounded-md font-rubik-light text-xs text-white px-2 py-1">
                        PAID
                      </Text>
                      <Text className="font-rubik-light text-sm text-gray-400">
                        Paid on: {formatMongoDate(bill.lastPaidDate || "")}
                      </Text>
                    </View>
                    <Text className="font-rubik-light text-sm text-gray-400 mt-1">
                      Next due: {formatMongoDate(bill.startDate || "")}
                    </Text>
                  </View>
                  <View className="justify-center ml-3 items-end">
                    <Text className="font-rubik-semibold text-xl text-gray-500 line-through">
                      ${bill.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkUnpaid(bill._id!)}
                      className="flex-row items-center gap-1 bg-orange-500 px-4 py-2 rounded-full mt-2"
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={14}
                        color="white"
                      />
                      <Text className="font-rubik-medium text-sm text-white">
                        Mark Unpaid
                      </Text>
                    </TouchableOpacity>
                  </View>
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
