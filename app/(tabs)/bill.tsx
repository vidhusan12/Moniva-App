import { Bill, deleteBill, fetchAllBill, updateBill } from "@/services/bill";
import {
  calculateBillTotal,
  calculateNextDueDate,
  calculatePreviousDueDate,
  getMonthlyUpcomingBills,
  getPaidBillsThisMonth,
} from "@/utils/billUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateForMongo, formatMongoDate } from "../../utils/mongoDate";

const BillDetails = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshToggle, setRefreshToggle] = useState(false);

  /**
   * Fetches all bills from the backend.
   * Wrapped in useCallback to prevent unnecessary re-renders.
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
   * refreshToggle is toggled after CRUD operations to force a re-fetch.
   */
  useFocusEffect(
    React.useCallback(() => {
      loadBills();
      return () => {};
    }, [loadBills, refreshToggle])
  );

  /**
   * Deletes a bill after user confirmation.
   * Triggers a refresh by toggling refreshToggle.
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
   * Marks a bill as paid:
   * - Sets lastPaidDate to today
   * - Advances startDate to the next due date based on frequency
   */
  const handleMarkPaid = async (bill: Bill) => {
    if (!bill.startDate || !bill._id || !bill.frequency) {
      Alert.alert("Error", "Bill data missing for payment.");
      return;
    }

    try {
      // 1. Calculate the next due date based on the *current* startDate
      const nextDateObject = calculateNextDueDate(
        bill.startDate,
        bill.frequency
      );
      const nextDateString = formatDateForMongo(nextDateObject);
      const paidDateString = formatDateForMongo(new Date());

      // 2. Update the bill: advance startDate and record today's payment
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
   * Marks a bill as unpaid:
   * - CRITICAL FIX: Base the rollback on the date that was just paid (lastPaidDate)
   * to accurately find the date for the previous cycle (the one that was just due).
   * - Clears lastPaidDate (sets it to empty string)
   * - Rolls back startDate to the previous due date
   */
  const handleMarkUnpaid = async (bill: Bill) => {
    if (!bill._id || !bill.startDate || !bill.frequency || !bill.lastPaidDate) {
      // <-- Added lastPaidDate check
      Alert.alert("Error", "Bill data missing.");
      return;
    }

    try {
      // 1. Calculate the actual previous due date for the payment just reverted.
      // We must roll back the *next* cycle's date (bill.startDate) by one cycle
      // to get the correct due date.
      const previousDueDate = calculatePreviousDueDate(
        bill.startDate, // <-- Use the rolled-forward startDate
        bill.frequency
      );
      const previousDateString = formatDateForMongo(previousDueDate);

      // 2. Update the bill: roll back startDate and clear lastPaidDate (using "" for database clear)
      await updateBill(bill._id, {
        startDate: previousDateString,
        lastPaidDate: "", // <-- CRITICAL FIX: Use empty string to clear the date
      });

      setRefreshToggle((prev) => !prev);

      Alert.alert(
        "Success",
        `${bill.description} marked as UNPAID. Due: ${formatMongoDate(previousDateString)}`
      );
    } catch (error) {
      console.error("Unpaid action failed:", error);
      Alert.alert("Error", "Failed to mark bill as unpaid.");
    }
  };

  // Calculate totals and filter bills
  const totalMonthlyBill = calculateBillTotal(bills);
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);
  const monthlyUpcomingBillsWithMeta = getMonthlyUpcomingBills(bills);

  // Filter out already-paid bills from the upcoming list
  const allUnpaidBills = monthlyUpcomingBillsWithMeta.filter(
    (upcomingBill) =>
      !paidBillsThisMonth.some((paidBill) => paidBill._id === upcomingBill._id)
  );

  // Separate unpaid bills by overdue status
  const overdueBills = allUnpaidBills.filter((bill) => bill.isOverdue);
  const dueThisMonthBills = allUnpaidBills.filter((bill) => !bill.isOverdue);

  // Display overdue bills first, then upcoming bills
  const finalUnpaidDisplayList = [...overdueBills, ...dueThisMonthBills];
  const totalUnpaidAmount = calculateBillTotal(finalUnpaidDisplayList);

  // Badge counts
  const unpaidCount = finalUnpaidDisplayList.length;
  const paidCount = paidBillsThisMonth.length;

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
        <Text className="text-xl font-rubik-semibold">Bills</Text>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Summary card: total unpaid bills and stats */}
        <View className="items-start w-full px-5 mt-3 mb-4">
          <View className="flex-row justify-between w-full bg-white rounded-2xl shadow-md shadow-black/10 px-3 py-3">
            <View>
              <Text className="font-rubik text-xs text-gray-700">
                Total Unpaid Bills
              </Text>
              <Text className="font-rubik-semibold text-3xl py-2 text-black">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-xs text-gray-700">
                {unpaidCount} pending - {paidCount} paid this month
              </Text>
            </View>
            <View className="justify-center pr-5">
              <FontAwesome name="dollar" size={30} color="#ef233c" />
            </View>
          </View>
        </View>

        {/* Section header: Upcoming Bills */}
        <View className="flex-row justify-between w-full px-5">
          <Text className="font-rubik-medium text-sm text-black-300">
            Upcoming Bills
          </Text>
          <Text className="bg-red-100 py-1 px-2 rounded-full font-rubik text-xs text-red-600">
            {unpaidCount} unpaid
          </Text>
        </View>

        {/* List of unpaid bills (overdue shown first, then due this month) */}
        <View className="items-start w-full px-5 mt-2 mb-4">
          {finalUnpaidDisplayList.map((bill) => (
            <View
              key={bill._id}
              className={`w-full rounded-2xl shadow-md shadow-black/10 mb-3 pb-3 ${
                bill.isOverdue ? "bg-red-50" : "bg-white"
              }`}
            >
              {/* Bill info row: description, frequency, due date, amount */}
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
                <View className="justify-center ml-2">
                  <Text className="font-rubik-semibold text-lg text-red-500">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action buttons: Edit, Paid, Delete */}
              <View className="flex-row justify-evenly px-2">
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/newBill",
                      params: { id: bill._id },
                    })
                  }
                  className="flex-row items-center gap-1 bg-blue-100 px-4 py-2 rounded-lg"
                >
                  <SimpleLineIcons name="pencil" size={14} color="blue" />
                  <Text className="font-rubik text-xs text-blue-700">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMarkPaid(bill)}
                  className="flex-row items-center gap-1 bg-green-100 px-4 py-2 rounded-lg"
                >
                  <Ionicons name="checkmark" size={14} color="green" />
                  <Text className="font-rubik text-xs text-green-700">
                    Paid
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(bill._id)}
                  className="flex-row items-center gap-1 bg-red-100 px-4 py-2 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={14} color="#ef233c" />
                  <Text className="font-rubik text-xs text-red-700">
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Section header: Paid Bills */}
        <View className="flex-row justify-between w-full px-5">
          <Text className="font-rubik-medium text-sm text-black-300">
            Paid This Month
          </Text>
          <Text className="bg-green-100 py-1 px-2 rounded-full font-rubik text-xs text-green-600">
            {paidCount} completed
          </Text>
        </View>

        {/* List of paid bills */}
        <View className="items-start w-full px-5 mt-2 mb-6">
          {paidBillsThisMonth.map((bill) => (
            <View
              key={bill._id}
              className="w-full bg-green-50 rounded-2xl shadow-md shadow-black/10 mb-3 pb-3 opacity-80"
            >
              {/* Bill info row: strikethrough description, paid badge, paid date */}
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
                </View>
                <View className="justify-center ml-2">
                  <Text className="font-rubik-semibold text-lg text-gray-500 line-through">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Action buttons: Mark as Unpaid, Edit */}
              <View className="flex-row justify-evenly px-2">
                <TouchableOpacity
                  onPress={() => handleMarkUnpaid(bill)}
                  className="flex-row items-center gap-1 bg-yellow-100 px-4 py-2 rounded-lg"
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={14}
                    color="#d90429"
                  />
                  <Text className="font-rubik text-xs text-red-700">
                    Unpaid
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/newBill",
                      params: { id: bill._id },
                    })
                  }
                  className="flex-row items-center gap-1 bg-blue-100 px-4 py-2 rounded-lg"
                >
                  <SimpleLineIcons name="pencil" size={14} color="blue" />
                  <Text className="font-rubik text-xs text-blue-700">Edit</Text>
                </TouchableOpacity>
              </View>

              {/* Next due date footer */}
              <Text className="text-center text-gray-400 font-rubik-light text-xs pt-2 pb-1">
                Next due: {formatMongoDate(bill.startDate || "")}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
