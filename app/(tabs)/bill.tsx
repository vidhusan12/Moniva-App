import { Bill, deleteBill, fetchAllBill } from "@/services/bill";
import {
  calculateWeeklyBillTotal,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import SimpleLineIcons from "@expo/vector-icons/SimpleLineIcons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatMongoDate } from "../../utils/mongoDate";

const BillDetails = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  const weeklyPlan = getWeeklySavingsPlan(bills);

  // You will need this function to refresh the list when you come back
  const loadBills = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllBill();
      setBills(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []); // Dependecies array is empty because no external states are needed

  useFocusEffect(
    React.useCallback(() => {
      loadBills();

      return () => {};
    }, [loadBills])
  );

  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

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

  const totalMonthlyBill = calculateWeeklyBillTotal(bills); // Total Monthly Bills
  const recommendedWeeklyBudget = totalMonthlyBill / 4; //Total weekly bills

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* Header adn Add Button */}
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
        {/* Total unpaid bills card */}
        <View className=" items-start w-full px-5 mt-4 mb-6 ">
          <View className="flex-row justify-between w-full max-w-md bg-white rounded-2xl shadow-md shadow-black/10 px-4 py-4">
            <View className="">
              <Text className="font-rubik">Total Unpaid Bills</Text>
              <Text className="font-medium text-4xl py-4">
                ${totalMonthlyBill.toFixed(2)}
              </Text>
              <Text className="font-rubik">3 pending - 2 paid this month</Text>
            </View>
            <View className="justify-center pr-5">
              <FontAwesome name="dollar" size={30} color="#ef233c" />
            </View>
          </View>
        </View>

        {/* UpComing and Unpaid */}
        <View className="flex-row justify-between w-full max-w-md px-4">
          <Text className="font-rubik-light text-xl">Upcoming Bills</Text>
          <Text className="bg-red-100 py-1 px-2 rounded-full font-rubik text-red-600">
            3 unpaid
          </Text>
        </View>

        {/* Bill Box*/}
        <View className="items-start w-full px-5 mt-4 mb-6">
          <View className="w-full max-w-md bg-white rounded-2xl shadow-md shadow-black/10">
            {bills.map((bill, index) => (
              // Bill Map View
              <View key={index}>
                <View className="flex-row justify-between p-5">
                  {/* Bill Details */}
                  <View className="">
                    <Text className="font-rubik-medium text-xl">
                      {bill.description}
                    </Text>
                    {/* Frequency and due date */}
                    <View className="flex-row gap-3 items-center pt-2">
                      <Text className="bg-gray-200 rounded-md font-rubik-light p-1">
                        {bill.frequency}
                      </Text>
                      <Text className="font-light">
                        Due:{formatMongoDate(bill.startDate || "")}
                      </Text>
                    </View>
                  </View>
                  {/* Amount */}
                  <View className="justify-center">
                    <Text className="font-rubik-medium text-2xl text-red-500">
                      ${bill.amount.toFixed(2)}
                    </Text>
                  </View>
                </View>
                {/* Buttons View */}
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
                    onPress={() => handleDelete(bill._id)}
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
        </View>

        {/* Paid Box */}
        <View className="flex-row justify-between w-full max-w-md px-4">
          <Text className="font-rubik-light text-xl">Paid This Month</Text>
          <Text className="bg-green-100 py-1 px-2 rounded-full font-rubik text-green-600">
            2 completed
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
