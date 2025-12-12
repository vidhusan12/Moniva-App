import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const transaction = () => {
  const [transaction, setTransaction] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <SafeAreaView className="flex-1 bg-[#ffffff]">
      {/* Header with title and add button */}
      <View className="px-5 pt-8 flex-row justify-between items-center">
        <View>
          <Text className="text-2xl font-rubik-semibold">Transactions</Text>
          <Text className="text-sm font-rubik-light">
            8 transactions • Last updated this afternoon
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newTransaction")}
          className="p-2"
        >
          <Ionicons name="add-circle" size={32} color="#ffd33d" />
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View>
          {/* Search Bar */}
          <View className="px-5 mt-4">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                className="flex-1 ml-3 text-base font-rubik"
                placeholder="Search transactions"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* Spending Month box */}
          <View className="flex-row justify-evenly mt-5 px-5 gap-3">
            <View className="flex-1 bg-gray-100 p-3 rounded-xl">
              <Text className="font-rubik text-base text-gray-600">
                TODAY'S SPENDING
              </Text>
              <Text className="font-rubik-medium text-xl text-gray-600 py-3">
                $0
              </Text>
              <Text className="font-rubik-light text-sm text-gray-600">
                • This week: $201
              </Text>
            </View>
            <View className="flex-1 bg-gray-100 p-3 rounded-xl">
              <Text className="font-rubik text-base text-gray-600">
                THIS MONTH
              </Text>
              <Text className="font-rubik-medium text-xl text-gray-600 py-3">
                $396
              </Text>
              <Text className="font-rubik-light text-sm text-gray-600">
                • Avg: $33/day
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default transaction;
