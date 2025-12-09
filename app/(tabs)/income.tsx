import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteIncome, fetchAllIncome, Income } from "../../services/income";
import { calculateDaysUntilPay } from "../../utils/mongoDate";

const IncomeDetails = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);

  // You will need this function to refresh the list when you come back
  const loadIncomes = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllIncome();
      setIncomes(data);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, []); // Dependecies array is empty because no external states are needed

  useFocusEffect(
    React.useCallback(() => {
      loadIncomes();

      return () => {};
    }, [loadIncomes])
  );

  // 5. Function to format the Date object for display (same as before)
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString("en-GB");
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      Alert.alert("Error", "No ID provided");
      return;
    }

    try {
      await deleteIncome(id); // calls teh delete api
      const updatedIncomes = await fetchAllIncome();
      setIncomes(updatedIncomes);
    } catch (error) {
      Alert.alert("Error", "Failed to delete income");
    }
  };

  const handleEdit = async (id?: string) => {};

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#ffffff]">
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* Header and Add Button */}
      <View className="px-5 pt-8 flex-row justify-between items-center">
        <Text className="text-2xl font-rubik-semibold">Your Finances</Text>

        {/* PLUS BUTTON to navigate */}
        <TouchableOpacity
          onPress={() => router.push("/newIncome")} // <-- Navigates to the new file
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {/* Income details card */}
        <View className="items-start w-full px-5 mt-4 mb-6">
          <Text className="text-lg font-rubik mb-2">Your Income</Text>
          <View className="w-full max-w-md bg-white rounded-2xl shadow-md shadow-black/10">
            {incomes.map((income, index) => (
              <View key={income._id} className="px-4 py-2.5">
                {/* Row 1: Description and Amount */}
                <View className="flex-row justify-between items-center mb-0.5">
                  {/* Left side: Description and Amount close together */}
                  <View className="flex-row items-center gap-3">
                    <Text className="font-rubik-medium text-lg">
                      {income.description}
                    </Text>
                    <Text className="font-rubik text-lg">
                      ${income.amount.toFixed(2)}
                    </Text>
                  </View>

                  {/* Right side: Edit and Delete buttons */}
                  <View className="flex-row gap-3">
                    <TouchableOpacity onPress={() => handleDelete(income._id)}>
                      <FontAwesome name="edit" size={18} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(income._id)}>
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
                    {income.frequency}
                  </Text>
                  <Text className="font-rubik text-sm text-gray-600 mx-1">
                    {" "}
                    •{" "}
                  </Text>
                  <Text className="font-rubik text-sm text-gray-600">
                    Next pay in : {calculateDaysUntilPay(income.startDate || "")}
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

export default IncomeDetails;
