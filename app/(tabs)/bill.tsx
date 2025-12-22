import SwipeableRow from "@/components/SwipeableRow";
import { auth } from "@/config/firebase"; // 🛡️ Required for User ID
import { FinanceService } from "@/services/financeService"; // 🏆 Unified Service
import { useFinanceStore } from "@/store/financeStore";
import {
  calculateBillTotal,
  getBillsDueCurrentMonth,
  getMonthlyUpcomingBills,
  getPaidBillsThisMonth,
  getWeeklyBillSummary,
  getWeeklySavingsPlan,
} from "@/utils/billUtils";
import { formatDisplayDate } from "@/utils/dateFormatting";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import React, { useMemo } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BillDetails = () => {
  // Access Global State
  const { bills, loading, refetchBills } = useFinanceStore();


  // ACTIONS (Delete, Pay, Unpay)


  const handleDelete = async (id?: string) => {
    if (!id) return;
    Alert.alert("Confirm Delete", "Permanently delete this bill?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: async () => {
          try {
            const user = auth.currentUser;
            if (!user) return;
            await FinanceService.deleteItem("bills", user.uid, id);
            refetchBills();
          } catch (error) {
            Alert.alert("Error", "Failed to delete bill");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleMarkPaid = async (billId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const updateData = {
        status: "paid" as const,
        lastPaidDate: new Date().toISOString(),
      };
      await FinanceService.updateItem("bills", user.uid, billId, updateData);
      refetchBills();
    } catch (error) {
      Alert.alert("Error", "Failed to mark as paid");
    }
  };

  // Ability to "Unpay" (Undo) a bill
  const handleMarkUnpaid = async (billId: string) => {
    try {
      const user = auth.currentUser;
      if (!user) return;
      const updateData = {
        status: "unpaid" as const,
        lastPaidDate: null, // Remove the date
      };
      await FinanceService.updateItem("bills", user.uid, billId, updateData);
      refetchBills();
    } catch (error) {
      Alert.alert("Error", "Failed to unpay bill");
    }
  };


  //MATH & FILTERS (Your Original Logic)
 

  const paidBillsThisMonth = useMemo(() => getPaidBillsThisMonth(bills), [bills]);

  const billsDueThisWeek = useMemo(
    () =>
      getWeeklyBillSummary(bills).filter(
        (weekBill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill.id === weekBill.id)
      ),
    [bills, paidBillsThisMonth]
  );

  const monthlyUpcomingBillsWithMeta = useMemo(
    () => getMonthlyUpcomingBills(bills),
    [bills]
  );

  const allUnpaidBills = useMemo(
    () =>
      monthlyUpcomingBillsWithMeta.filter(
        (upcomingBill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill.id === upcomingBill.id)
      ),
    [monthlyUpcomingBillsWithMeta, paidBillsThisMonth]
  );

  const { overdue, dueThisMonth } = useMemo(() => {
    const overdueBills = allUnpaidBills.filter((bill) => bill.isOverdue);
    const dueThisMonthBills = allUnpaidBills.filter((bill) => !bill.isOverdue);
    return { overdue: overdueBills, dueThisMonth: dueThisMonthBills };
  }, [allUnpaidBills]);

  const finalUnpaidDisplayList = useMemo(
    () => [...overdue, ...dueThisMonth],
    [overdue, dueThisMonth]
  );

  const unpaidBillsThisMonth = useMemo(
    () =>
      getBillsDueCurrentMonth(bills).filter(
        (bill) => !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
      ),
    [bills, paidBillsThisMonth]
  );

  const totalUnpaidAmount = useMemo(
    () => calculateBillTotal(unpaidBillsThisMonth),
    [unpaidBillsThisMonth]
  );
  const weeklySavingsPlan = useMemo(() => getWeeklySavingsPlan(bills), [bills]);

  // Loading State
  if (loading && bills.length === 0) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <Text className="text-white">Loading Bills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      
      {/* HEADER */}
      <View className="px-5 pt-5 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-rubik-semibold text-white">Bills</Text>
          <Text className="text-sm font-rubik-light text-gray-400">
            {unpaidBillsThisMonth.length} pending • {paidBillsThisMonth.length} paid
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/5"
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* STATS CARDS (Premium Look) */}
        <View className="flex-row px-5 gap-3 mb-8">
            
            {/* Total Unpaid */}
            <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-red-500/20">
                <View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="alert-circle" size={20} color="#ef4444" />
                </View>
                <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Total Unpaid
                </Text>
                <Text className="font-rubik-semibold text-2xl text-white">
                    ${totalUnpaidAmount.toFixed(2)}
                </Text>
                <Text className="font-rubik text-[10px] text-gray-500 mt-1">
                    Due this month
                </Text>
            </View>

            {/* Weekly Target */}
            <View className="flex-1 bg-[#1a1a1a] rounded-3xl p-4 border border-blue-500/20">
                <View className="w-10 h-10 bg-blue-500/10 rounded-full items-center justify-center mb-3">
                    <Ionicons name="shield-checkmark" size={20} color="#3b82f6" />
                </View>
                <Text className="font-rubik text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                    Weekly Target
                </Text>
                <Text className="font-rubik-semibold text-2xl text-white">
                    ${weeklySavingsPlan.finalWeeklyTarget.toFixed(2)}
                </Text>
                <Text className="font-rubik text-[10px] text-gray-500 mt-1">
                    Save this week
                </Text>
            </View>
        </View>

        {/* LIST: DUE THIS WEEK (High Priority) */}
        {billsDueThisWeek.length > 0 && (
          <View className="px-5 mb-6">
            <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1">
              Due This Week
            </Text>
            {billsDueThisWeek.map((bill) => (
              <View
                key={bill.id}
                className="border border-orange-500/30 bg-orange-500/5 rounded-2xl p-4 mb-3 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 bg-orange-500/10 rounded-full items-center justify-center">
                        <Ionicons name="time" size={20} color="#f97316" />
                    </View>
                    <View>
                        <Text className="text-white text-lg font-rubik-medium">
                            {bill.description}
                        </Text>
                        <Text className="text-orange-400 font-bold text-xs mt-1">
                            Due Soon
                        </Text>
                    </View>
                </View>
                <Text className="text-white font-rubik-semibold text-lg">
                    ${bill.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* LIST: UPCOMING & OVERDUE */}
        <View className="px-5 mb-6">
          <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1">
              Upcoming
          </Text>
          {finalUnpaidDisplayList.map((bill) => (
            <SwipeableRow
              key={bill.id}
              onSwipeLeft={() => handleDelete(bill.id)}
              onSwipeRight={() =>
                router.push({ pathname: "/newBill", params: { id: bill.id } })
              }
            >
              <View
                className={`bg-[#1a1a1a] rounded-2xl p-4 mb-3 border ${bill.isOverdue ? "border-red-600/40" : "border-white/5"}`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-white text-lg font-rubik-medium">
                      {bill.description}
                    </Text>
                    <Text className={`text-xs mt-1 font-rubik ${bill.isOverdue ? "text-red-400 font-bold" : "text-gray-400"}`}>
                      {bill.isOverdue ? "Overdue" : "Due"}: {formatDisplayDate(bill.startDate)}
                    </Text>
                  </View>
                  
                  {/* Pay Button */}
                  <TouchableOpacity
                    onPress={() => handleMarkPaid(bill.id!)}
                    className="bg-green-600/20 px-4 py-2 rounded-xl border border-green-600/50"
                  >
                    <Text className="text-green-400 font-rubik-semibold">
                      Pay ${bill.amount.toFixed(0)}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </View>

        {/* LIST: PAID BILLS (Restored Feature) */}
        {paidBillsThisMonth.length > 0 && (
            <View className="px-5 pb-20">
                <Text className="text-gray-500 font-rubik-medium mb-3 uppercase text-xs tracking-widest px-1">
                    Paid This Month
                </Text>
                {paidBillsThisMonth.map((bill) => (
                    <SwipeableRow
                        key={bill.id}
                        onSwipeLeft={() => handleDelete(bill.id)}
                        onSwipeRight={() =>
                            router.push({ pathname: "/newBill", params: { id: bill.id } })
                        }
                    >
                        <View className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-white/5 opacity-50">
                            <View className="flex-row justify-between items-center">
                                <View className="flex-row items-center gap-3">
                                    <View className="w-8 h-8 bg-green-500/20 rounded-full items-center justify-center">
                                        <Ionicons name="checkmark" size={16} color="#4ade80" />
                                    </View>
                                    <View>
                                        <Text className="text-gray-300 text-lg font-rubik-medium line-through">
                                            {bill.description}
                                        </Text>
                                        <Text className="text-gray-500 text-xs">
                                            Paid
                                        </Text>
                                    </View>
                                </View>
                                
                                {/* UNPAY BUTTON (Undo) */}
                                <TouchableOpacity
                                    onPress={() => handleMarkUnpaid(bill.id!)}
                                    className="p-2"
                                >
                                    <Ionicons name="refresh" size={20} color="#666" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </SwipeableRow>
                ))}
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default BillDetails;