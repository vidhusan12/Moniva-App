import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, Stack } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Savings = () => {
  const { savings, refetchSavings } = useFinanceStore();

  const handleDelete = async (id?: string) => {
    if (!id) return;
    Alert.alert("Delete Goal", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          const user = auth.currentUser;
          if (user) {
            await FinanceService.deleteItem("savings", user.uid, id);
            refetchSavings();
          }
        },
        style: "destructive",
      },
    ]);
  };

  const totalSaved = useMemo(() => {
    return savings.reduce((total, s) => total + (s.currentAmount || 0), 0);
  }, [savings]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen options={{ headerShown: false }} />

      {/* HEADER */}
      <View className="px-6 pt-6 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-rubik-bold text-white">Savings</Text>
          <Text className="text-base font-rubik text-gray-400 mt-1">
            {savings.length} Goals • ${totalSaved.toLocaleString()} Saved
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newSavings")}
          className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView className="mt-8 px-6" showsVerticalScrollIndicator={false}>
        {/* Empty State */}
        {savings.length === 0 && (
          <View className="items-center justify-center py-20 opacity-50">
            <Ionicons name="wallet-outline" size={60} color="white" />
            <Text className="text-gray-500 font-rubik text-lg mt-4">
              No goals yet
            </Text>
          </View>
        )}

        {/* Goals List */}
        <View className="pb-20">
          {savings.map((item) => {
            const progress =
              item.targetAmount > 0
                ? (item.currentAmount || 0) / item.targetAmount
                : 0;
            const percent = Math.min(100, Math.round(progress * 100));

            return (
              <SwipeableRow
                key={item.id}
                onSwipeLeft={() => handleDelete(item.id)}
                onSwipeRight={() =>
                  router.push({
                    pathname: "/newSavings",
                    params: { id: item.id },
                  })
                }
              >
                <View className="bg-[#1a1a1a] rounded-3xl p-5 mb-4 border border-white/5">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-xl font-rubik-bold text-white">
                        {item.name}
                      </Text>
                      <Text className="text-gray-400 text-xs font-rubik mt-1">
                        Target: ${item.targetAmount.toLocaleString()}
                      </Text>
                    </View>
                    <View className="bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                      <Text className="text-teal-400 font-rubik-bold text-sm">
                        {percent}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View className="h-3 bg-black rounded-full overflow-hidden border border-white/5">
                    <View
                      style={{ width: `${percent}%` }}
                      className="h-full bg-teal-500 rounded-full"
                    />
                  </View>

                  <View className="flex-row justify-between items-center mt-3">
                    <Text className="text-gray-500 text-xs font-rubik">
                      Current
                    </Text>
                    <Text className="text-white font-rubik-bold text-lg">
                      ${(item.currentAmount || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              </SwipeableRow>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Savings;
