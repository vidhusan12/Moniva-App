import { addBilll, Bill, deleteBill, fetchAllBill } from "@/services/bill";
import { useFocusEffect } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BillDetails = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("")
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  const frequencyOptions = ["Weekly", "Fortnightly", "Monthly", "One Time"];

  useFocusEffect(
    React.useCallback(() => {
      const loadBills = async () => {
        try {
          setLoading(true);
          const data = await fetchAllBill();
          setBills(data);
        } catch (error) {
          console.log("Error", error);
        } finally {
          setLoading(false);
        }
      };
      loadBills();
    }, [])
  );

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (
      !parsedAmount ||
      isNaN(parsedAmount) ||
      description.trim() === "" ||
      !frequency
    ) {
      Alert.alert("Error", "Enter amount, description, and select frequency.");
      return;
    }

    try {
      await addBilll({
        amount: parsedAmount,
        description: description.trim(),
        frequency: frequency,
        startDate: startDate,
      });

      Alert.alert("Success", "Bill added!");
      setAmount("");
      setDescription("");
      setFrequency("");
      const data = await fetchAllBill();
      setBills(data);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
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

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Header */}
        <View className="px-5 pt-8 items-start">
          <Text className="text-2xl font-rubik-semibold">New Bill</Text>
          <Text className="text-sm font-rubik-light text-gray-700 mb-4">
            Add your bill and how often you receive it
          </Text>
        </View>

        {/* Bill Amount Card */}
        <View className=" px-5 items-start w-full">
          <View className="w-full max-w-md bg-white rounded-2xl p-5 shadow-md shadow-black/10">
            <Text className="font-rubik pb-4 text-lg tracking-wider">
              Bill amount
            </Text>
            <TextInput
              className="text-3xl font-rubik bg-transparent mb-8"
              placeholder="$0.00"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholderTextColor="#333"
            />
          </View>
        </View>

        {/* Description label OUTSIDE the box */}
        <View className="items-start w-full px-5 mt-4">
          <Text className="text-lg font-rubik mb-1">Description</Text>
        </View>
        <View className="items-start w-full">
          <View className="w-11/12 max-w-md bg-white rounded-2xl mx-4 shadow-md shadow-black/10 ">
            <TextInput
              placeholder="e.g. Netflix, Prime"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor="#adb5bd"
              className="text-base font-rubik bg-transparent py-4 px-3 min-h-[48px]"
            />
          </View>
        </View>

        {/* Frequency box */}
        <View className="items-start w-full px-5 mt-4">
          <Text className="text-lg font-rubik mb-1">Frequency</Text>
          <View className="flex-row space-x-4">
            {frequencyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => setFrequency(option)}
                className={`px-4 py-2 rounded-xl border ${
                  frequency === option
                    ? "bg-[#ffd33d] border-[#ffd33d] text-black font-rubik-semibold"
                    : "bg-white border-gray-300 text-gray-700 font-rubik"
                }`}
              >
                <Text
                  className={`${
                    frequency === option
                      ? "text-black font-rubik-semibold"
                      : "text-gray-700 font-rubik"
                  }`}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ADD & Cancel box */}
        <View className="justify-center items-center gap-4  mt-4">
          <TouchableOpacity
            className="bg-blue-500 px-8 py-3 rounded-lg w-48"
            onPress={handleSubmit}
          >
            <Text className="font-rubik text-lg text-center">Add</Text>
          </TouchableOpacity>
        </View>

        {/* Income details card */}
        <View className="items-start w-full px-5 mt-4 mb-6">
          <Text className="text-lg font-rubik mb-2">Your Bill</Text>
          <View className="w-full max-w-md bg-white rounded-2xl shadow-md shadow-black/10">
            {bills.map((bill, index) => (
              <View key={bill._id} className="px-4 py-2.5">
                {/* Row 1: Description and Amount */}
                <View className="flex-row justify-between items-center mb-0.5">
                  {/* Left side: Description and Amount close together */}
                  <View className="flex-row items-center gap-3">
                    <Text className="font-rubik-medium text-lg">
                      {bill.description}
                    </Text>
                    <Text className="font-rubik text-lg">
                      ${bill.amount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Right side: Edit and Delete buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => handleDelete(bill._id)}>
                      <FontAwesome name="edit" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(bill._id)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef233c"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Row 2: Frequency and Next Pay */}
                <View className="flex-row">
                  <Text className="font-rubik text-sm text-gray-600">
                    {bill.frequency}
                  </Text>
                  <Text className="font-rubik text-sm text-gray-600 mx-1">
                    {" "}
                    •{" "}
                  </Text>
                  <Text className="font-rubik text-sm text-gray-600">
                    Next pay: 30 Aug
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;
