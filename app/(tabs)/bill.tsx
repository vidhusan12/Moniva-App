import { Bill, deleteBill, fetchAllBill, updateBill } from "@/services/bill";
import {
  calculateNextDueDate,
  calculateWeeklyBillTotal,
  getMonthlyUpcomingBills,
  getPaidBillsThisMonth,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { format } from "date-fns";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMongoDate } from "../../utils/mongoDate";

const BillDetails = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bills from backend and update state
  const loadBills = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllBill();
      setBills(data);
    } catch (error) {
      // Optionally handle error here
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh bills when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadBills();
      return () => {};
    }, [loadBills])
  );

  // Format JS Date object for display
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  // Delete a bill by ID and refresh list
  const handleDelete = async (id?: string) => {
    if (!id) {
      Alert.alert("Error", "No ID Provided");
      return;
    }
    try {
      await deleteBill(id);
      const updatedBills = await fetchAllBill();
      setBills(updatedBills);
    } catch (error) {
      Alert.alert("Error", "Failed to delete bill");
    }
  };

  // Mark a bill as paid, update its next due date, and refresh list
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
      const nextDateString = format(nextDateObject, "yyyy-MM-dd");
      await updateBill(bill._id, { startDate: nextDateString });
      Alert.alert(
        "Success",
        `${bill.description} marked as paid! Next due date: ${nextDateString}`
      );
      loadBills();
    } catch (error) {
      console.error("Payment failed:", error);
      Alert.alert("Error", "Failed to mark bill as paid.");
    }
  };

  // Calculate bill and savings stats
  const totalMonthlyBill = calculateWeeklyBillTotal(bills);

  const weeklyPlan = getWeeklySavingsPlan(bills);
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);

  // Get all upcoming/overdue bills for this month
  const monthlyUpcomingBillsWithMeta = getMonthlyUpcomingBills(bills);

  // Filter out bills already paid this month
  const allUnpaidBills = monthlyUpcomingBillsWithMeta.filter((upcomingBill) => {
    return !paidBillsThisMonth.some(
      (paidBill) => paidBill._id === upcomingBill._id
    );
  });

  // Separate unpaid bills into overdue and due this month
  const overdueBills = allUnpaidBills.filter((bill) => bill.isOverdue);
  const dueThisMonthBills = allUnpaidBills.filter((bill) => !bill.isOverdue);

  // Combine for display: overdue first, then due this month
  const finalUnpaidDisplayList = [...overdueBills, ...dueThisMonthBills];

  const totalUnpaidAmount = calculateWeeklyBillTotal(finalUnpaidDisplayList);

  // Badge counts
  const unpaidCount = finalUnpaidDisplayList.length;
  const paidCount = paidBillsThisMonth.length;

  if (loading) {
    // Loading spinner view
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* --- Header and Add Bill Button --- */}
      <View className="px-5 pt-8 flex-row justify-between items-center">
        <Text className="text-2xl font-rubik-semibold">Bills</Text>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* --- Total Unpaid Bills Card --- */}
        <View className="items-start w-full px-5 mt-4 mb-6">
          <View className="flex-row justify-between w-full max-w-md bg-white rounded-2xl shadow-md shadow-black/10 px-4 py-4">
            {/* Left: Bill summary and stats */}
            <View>
              <Text className="font-rubik">Total Unpaid Bills</Text>
              <Text className="font-medium text-4xl py-4">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
              <Text className="font-rubik">
                {unpaidCount} pending - {paidCount} paid this month
              </Text>
            </View>
            {/* Right: Dollar icon */}
            <View className="justify-center pr-5">
              <FontAwesome name="dollar" size={30} color="#ef233c" />
            </View>
          </View>
        </View>

        {/* --- Upcoming Bills Header --- */}
        <View className="flex-row justify-between w-full max-w-md px-4">
          <Text className="font-rubik-light text-xl">Upcoming Bills</Text>
          <Text className="bg-red-100 py-1 px-2 rounded-full font-rubik text-red-600">
            {unpaidCount} unpaid
          </Text>
        </View>

        {/* --- Unpaid Bills List --- */}
        <View className="items-start w-full px-5 mt-4 mb-6">
          {finalUnpaidDisplayList.map((bill, index) => (
            <View
              key={bill._id}
              className={`w-full max-w-md rounded-2xl shadow-md shadow-black/10 mb-5 pb-5 ${
                bill.isOverdue ? "bg-red-50" : "bg-white"
              }`}
            >
              {/* --- Bill Details Row --- */}
              <View className="flex-row justify-between p-5">
                {/* Left: Bill description, frequency, due/overdue */}
                <View>
                  <Text className="font-rubik-medium text-xl">
                    {bill.description}
                  </Text>
                  <View className="flex-row gap-3 items-center pt-2">
                    <Text className="bg-gray-200 rounded-md font-rubik-light p-1">
                      {bill.frequency}
                    </Text>
                    {bill.isOverdue ? (
                      <Text className="font-semibold text-red-600">
                        Overdue: Pay Now!
                      </Text>
                    ) : (
                      <Text className="font-light">
                        Due: {formatMongoDate(bill.startDate || "")}
                      </Text>
                    )}
                  </View>
                </View>
                {/* Right: Bill amount */}
                <View className="justify-center">
                  <Text className="font-rubik-medium text-2xl text-red-500">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
              {/* --- Bill Action Buttons Row --- */}
              <View className="flex-row justify-evenly">
                {/* Edit Button */}
                <TouchableOpacity
                  onPress={() => handleDelete(bill._id)}
                  className="flex-row items-center gap-2 bg-blue-100 px-6 py-3 rounded-lg"
                >
                  <SimpleLineIcons name="pencil" size={16} color="blue" />
                  <Text className="font-rubik text-blue-700">Edit</Text>
                </TouchableOpacity>
                {/* Paid Button */}
                <TouchableOpacity
                  onPress={() => handleMarkPaid(bill)}
                  className="flex-row items-center gap-2 bg-green-100 px-6 py-3 rounded-lg"
                >
                  <Ionicons name="checkmark" size={16} color="green" />
                  <Text className="font-rubik text-green-700">Paid</Text>
                </TouchableOpacity>
                {/* Delete Button */}
                <TouchableOpacity
                  onPress={() => handleDelete(bill._id)}
                  className="flex-row items-center gap-2 bg-red-100 px-6 py-3 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={16} color="#ef233c" />
                  <Text className="font-rubik text-red-700">Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* --- Paid Bills Header --- */}
        <View className="flex-row justify-between w-full max-w-md px-4">
          <Text className="font-rubik-light text-xl">Paid This Month</Text>
          <Text className="bg-green-100 py-1 px-2 rounded-full font-rubik text-green-600">
            {paidCount} completed
          </Text>
        </View>

        {/* Paid Bills List */}
        <View className="items-start w-full px-5 mt-4 mb-6">
          {paidBillsThisMonth.map((bill) => (
            <View
              key={bill._id}
              className="w-full max-w-md bg-green-50 rounded-2xl shadow-md shadow-black/10 mb-5 pb-5 opacity-80"
            >
              <View className="flex-row justify-between p-5">
                {/* Bill Details */}
                <View className="">
                  {/* Strikethrough the name */}
                  <Text className="font-rubik-medium text-xl line-through">
                    {bill.description}
                  </Text>
                  {/* Display Paid status and date */}
                  <View className="flex-row gap-3 items-center pt-2">
                    <Text className="bg-green-200 rounded-md font-rubik-light p-1">
                      PAID
                    </Text>
                    <Text className="font-light">
                      {/* ACCESS lastPaidDate */}
                      Paid on: {formatMongoDate(bill.lastPaidDate || "")}
                    </Text>
                  </View>
                </View>
                {/* Amount (grayed out and strikethrough) */}
                <View className="justify-center">
                  <Text className="font-rubik-medium text-2xl text-gray-500 line-through">
                    ${bill.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
              <Text className="text-center text-gray-400 font-light pb-2">
                {/* ACCESS startDate for NEXT due date */}
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
