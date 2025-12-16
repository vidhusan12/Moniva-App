import SwipeableRow from "@/components/SwipeableRow";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useFocusEffect } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteIncome, fetchAllIncome, Income } from "../../services/income";
import { formatMongoDate } from "../../utils/mongoDate";

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

    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this income permanently?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: async () => {
            try {
              await deleteIncome(id);
              const updatedIncomes = await fetchAllIncome();
              setIncomes(updatedIncomes);
            } catch (error) {
              console.error("Deletion failed:", error);
              Alert.alert("Error", "Failed to delete income");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  // Calculate total income
  const totalIncome = useMemo(() => {
    return incomes.reduce((total, income) => total + income.amount, 0);
  }, [incomes]);

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
        <View>
          <Text className="text-2xl font-rubik-semibold">Income</Text>
          <Text className="text-xs font-rubik-light text-gray-700">
            {incomes.length} {incomes.length === 1 ? "source" : "sources"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newIncome")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        {/* Summary card: total income */}
        <View className="px-5 mt-3">
          <View className="flex-row justify-between w-full bg-white rounded-2xl shadow-md shadow-black/10 p-4">
            <View className="flex-1">
              <Text className="font-rubik text-xs text-gray-700">
                TOTAL INCOME
              </Text>
              <Text className="font-rubik-semibold text-3xl py-2 text-black">
                ${totalIncome.toFixed(2)}
              </Text>
              <Text className="font-rubik-light text-xs text-gray-700">
                All sources combined
              </Text>
            </View>
            <View className="justify-center">
              <FontAwesome name="dollar" size={32} color="#10b981" />
            </View>
          </View>
        </View>

        {/* Section header: Your Income Sources */}
        <View className="px-5 mt-4 mb-2">
          <Text className="font-rubik-medium text-sm text-black-300">
            Your Income Sources ({incomes.length})
          </Text>
        </View>

        {/* List of income sources with swipe */}
        <View className="px-5 mb-4">
          {incomes.map((income) => (
            <SwipeableRow
              key={income._id}
              onSwipeLeft={() => handleDelete(income._id)}
              onSwipeRight={() =>
                router.push({
                  pathname: "/newIncome",
                  params: { id: income._id },
                })
              }
            >
              <View className="w-full bg-green-50 rounded-2xl shadow-md shadow-black/10 mb-3 p-4">
                <View className="flex-row justify-between items-start">
                  <View className="flex-1">
                    <Text className="font-rubik-semibold text-lg text-black">
                      {income.description}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Text className="font-rubik text-xs text-gray-600">
                        {income.frequency}
                      </Text>
                      <Text className="font-rubik text-xs text-gray-600 mx-1">
                        •
                      </Text>
                      <Text className="font-rubik text-xs text-gray-600">
                        Next: {formatMongoDate(income.startDate || "")}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-rubik-semibold text-xl text-green-600 ml-2">
                    ${income.amount.toFixed(2)}
                  </Text>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default IncomeDetails;
