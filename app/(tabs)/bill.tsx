import SwipeableRow from "@/components/SwipeableRow";
import { Bill, deleteBill, fetchAllBill, updateBill } from "@/services/bill";
import {
  calculateBillTotal,
  calculateNextDueDate,
  calculatePreviousDueDate,
  getBillsDueCurrentMonth,
  getMonthlyUpcomingBills,
  getPaidBillsThisMonth,
  getWeeklyBillSummary,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { parseISO } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateForMongo, formatMongoDate } from "../../utils/mongoDate";

const BillDetails = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  /**
   * Fetches all bills from the backend.
   */
  const loadBills = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllBill();
      setBills(data);
    } catch (error) {
      console.error("Failed to fetch bills:", error);
      Alert.alert("Error", "Failed to load bills.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reloads bills when the screen gains focus or when refreshToggle changes.
   */
  useFocusEffect(
    React.useCallback(() => {
      loadBills();
      return () => {};
    }, [loadBills, refreshToggle])
  );

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
              setRefreshToggle((prev) => !prev);
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
  const handleMarkPaid = async (bill: Bill) => {
    if (!bill.startDate || !bill._id || !bill.frequency) {
      Alert.alert("Error", "Bill data missing for payment.");
      return;
    }

    try {
      const nextDateObject = calculateNextDueDate(
        bill.startDate,
        bill.frequency
      );
      const nextDateString = formatDateForMongo(nextDateObject);
      const paidDateString = formatDateForMongo(new Date());

      await updateBill(bill._id, {
        startDate: nextDateString,
        lastPaidDate: paidDateString,
      });

      setRefreshToggle((prev) => !prev);

      Alert.alert(
        "Success",
        `${bill.description} marked as paid! Next due: ${formatMongoDate(nextDateString)}`
      );
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
      const bill = bills.find((b) => b._id === billId);
      if (!bill) return;

      // DEBUG: Log what we have
      console.log("=== DEBUG MARK UNPAID ===");
      console.log("Bill description:", bill.description);
      console.log("Current startDate:", bill.startDate);
      console.log("originalDueDate:", bill.originalDueDate);
      console.log("Has originalDueDate?", !!bill.originalDueDate);

      // Simple rollback: just use originalDueDate directly
      // In handleMarkUnpaid
      const prevDateObj = (() => {
        if (bill.originalDueDate) {
          return parseISO(bill.originalDueDate);
        }
        // Fallback for bills without originalDueDate
        if (bill.startDate) {
          return calculatePreviousDueDate(bill.startDate, bill.frequency);
        }
        // Last resort - use today's date
        return new Date();
      })();

      const prevDateString = formatDateForMongo(prevDateObj);

      await updateBill(billId, {
        startDate: prevDateString,
        lastPaidDate: "",
      });

      setRefreshToggle((prev) => !prev);
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* Header with title and add button */}
      <View className="px-5 pt-3 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-rubik-semibold">Bills</Text>
          <Text className="text-xs font-rubik-light text-gray-700">
            {unpaidCount} pending • {paidCount} paid
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Summary card: total unpaid bills and stats */}
        <View className="px-5 mt-3">
          <View className="flex-row justify-between w-full bg-white rounded-2xl shadow-md shadow-black/10 p-4">
            <View className="flex-1">
              <Text className="font-rubik text-xs text-gray-700">
                TOTAL UNPAID
              </Text>
              <Text className="font-rubik-semibold text-3xl py-2 text-black">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-xs text-gray-700">
                Due this month
              </Text>
            </View>
            <View className="justify-center">
              <FontAwesome name="dollar" size={32} color="#ef233c" />
            </View>
          </View>
        </View>

        {/* Weekly Savings Plan Card */}
        <View className="px-5 mt-3">
          <View className="w-full bg-blue-50 rounded-2xl shadow-md shadow-black/10 p-4">
            <Text className="font-rubik text-xs text-gray-700">
              WEEKLY SAVINGS TARGET
            </Text>
            <Text className="font-rubik-semibold text-2xl py-2 text-blue-600">
              ${weeklySavingsPlan.finalWeeklyTarget.toFixed(2)}
            </Text>
            <Text className="font-rubik-light text-xs text-gray-700">
              Due this week: $
              {weeklySavingsPlan.billsDueThisWeekTotal.toFixed(2)} • Buffer: $
              {weeklySavingsPlan.futureBufferContribution.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Bills Due This Week Section */}
        {billsDueThisWeek.length > 0 && (
          <>
            <View className="px-5 mt-4 mb-2">
              <Text className="font-rubik-medium text-sm text-black-300">
                Due This Week ({billsDueThisWeek.length})
              </Text>
            </View>

            <View className="px-5 mb-4">
              {billsDueThisWeek.map((bill) => (
                <View
                  key={bill._id}
                  className="w-full bg-orange-50 rounded-2xl shadow-md shadow-black/10 mb-3 p-3"
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-1">
                      <Text className="font-rubik-medium text-base text-black">
                        {bill.description}
                      </Text>
                      <Text className="font-rubik-light text-xs text-gray-700 mt-1">
                        Due: {formatMongoDate(bill.startDate || "")}
                      </Text>
                    </View>
                    <Text className="font-rubik-semibold text-lg text-orange-600 ml-2">
                      ${bill.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Section header: Upcoming Bills */}
        <View className="px-5 mt-4 mb-2">
          <Text className="font-rubik-medium text-sm text-black-300">
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
                className={`w-full rounded-2xl shadow-md shadow-black/10 mb-2 ${
                  bill.isOverdue ? "bg-red-50" : "bg-white"
                }`}
              >
                <View className="flex-row justify-between p-3">
                  <View className="flex-1">
                    <Text className="font-rubik-medium text-base text-black">
                      {bill.description}
                    </Text>
                    <View className="flex-row gap-2 items-center pt-1">
                      <Text className="bg-gray-200 rounded-md font-rubik-light text-xs p-1">
                        {bill.frequency}
                      </Text>
                      {bill.isOverdue ? (
                        <Text className="font-rubik-semibold text-xs text-red-600">
                          Overdue: Pay Now!
                        </Text>
                      ) : (
                        <Text className="font-rubik-light text-xs text-gray-700">
                          Due: {formatMongoDate(bill.startDate || "")}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="justify-center ml-2 items-end">
                    <Text className="font-rubik-semibold text-lg text-red-500">
                      ${bill.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(bill)}
                      className="flex-row items-center gap-1 bg-green-500 px-3 py-1 rounded-full mt-2"
                    >
                      <Ionicons name="checkmark" size={12} color="white" />
                      <Text className="font-rubik-medium text-xs text-white">
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
        <View className="px-5 mt-4 mb-2">
          <Text className="font-rubik-medium text-sm text-black-300">
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
              <View className="w-full bg-green-50 rounded-2xl shadow-md shadow-black/10 mb-2 opacity-80">
                <View className="flex-row justify-between p-3">
                  <View className="flex-1">
                    <Text className="font-rubik-medium text-base text-black line-through">
                      {bill.description}
                    </Text>
                    <View className="flex-row gap-2 items-center pt-1">
                      <Text className="bg-green-200 rounded-md font-rubik-light text-xs p-1">
                        PAID
                      </Text>
                      <Text className="font-rubik-light text-xs text-gray-700">
                        Paid on: {formatMongoDate(bill.lastPaidDate || "")}
                      </Text>
                    </View>
                    <Text className="font-rubik-light text-xs text-gray-400 mt-1">
                      Next due: {formatMongoDate(bill.startDate || "")}
                    </Text>
                  </View>
                  <View className="justify-center ml-2 items-end">
                    <Text className="font-rubik-semibold text-lg text-gray-500 line-through">
                      ${bill.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkUnpaid(bill._id!)}
                      className="flex-row items-center gap-1 bg-orange-500 px-3 py-1 rounded-full mt-2"
                    >
                      <Ionicons
                        name="close-circle-outline"
                        size={12}
                        color="white"
                      />
                      <Text className="font-rubik-medium text-xs text-white">
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
