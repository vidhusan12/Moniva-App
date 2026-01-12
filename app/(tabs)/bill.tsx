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

// ✨ RETRO DESIGN SYSTEM
const retro = {
  bg: "bg-[#FFFDF5]",
  card: "bg-white border-2 border-black rounded-xl",
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  btnShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  colors: {
    yellow: "#ffd33d",
    teal: "#2EC4B6",
    red: "#ef233c",
    green: "#10b981",
    orange: "#fb923c",
    blue: "#3b82f6",
    purple: "#a855f7",
  },
};

const BillDetails = () => {
  // Access Global State
  const { bills, loading, refetchBills } = useFinanceStore();

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

  const paidBillsThisMonth = useMemo(
    () => getPaidBillsThisMonth(bills),
    [bills]
  );

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
          !paidBillsThisMonth.some(
            (paidBill) => paidBill.id === upcomingBill.id
          )
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
        (bill) =>
          !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
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
      <SafeAreaView
        className={`flex-1 items-center justify-center ${retro.bg}`}
      >
        <Text className="text-black font-rubik-bold">Loading Bills...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-16 right-10 w-14 h-14 bg-[#ef233c] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-40 left-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 right-12 w-12 h-12 bg-[#fb923c] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      {/* HEADER */}
      <View className="px-5 pt-5 flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-3xl font-rubik-bold text-black uppercase tracking-tight">
            Bills
          </Text>
          <Text className="text-sm font-rubik-bold text-gray-500 uppercase tracking-widest">
            {unpaidBillsThisMonth.length} pending • {paidBillsThisMonth.length}{" "}
            paid
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/newBill")}
          className="w-12 h-12 bg-[#ef233c] rounded-full items-center justify-center border-2 border-black"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* STATS CARDS */}
        <View className="flex-row px-5 gap-3 mb-8">
          {/* Total Unpaid */}
          <View
            className={`flex-1 p-4 justify-between ${retro.card}`}
            style={retro.btnShadow}
          >
            <View className="w-10 h-10 bg-[#FF6B6B] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="alert-circle" size={20} color="black" />
            </View>
            <View>
              <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Total Unpaid
              </Text>
              <Text className="font-rubik-bold text-2xl text-black">
                ${totalUnpaidAmount.toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Weekly Target */}
          <View
            className={`flex-1 p-4 justify-between ${retro.card}`}
            style={retro.btnShadow}
          >
            <View className="w-10 h-10 bg-[#FFD93D] border-2 border-black rounded-lg items-center justify-center mb-3">
              <Ionicons name="shield-checkmark" size={20} color="black" />
            </View>
            <View>
              <Text className="font-rubik-bold text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                Weekly Target
              </Text>
              <Text className="font-rubik-bold text-2xl text-black">
                ${weeklySavingsPlan.finalWeeklyTarget.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* LIST: DUE THIS WEEK (High Priority) */}
        {billsDueThisWeek.length > 0 && (
          <View className="px-5 mb-6">
            <Text className="text-gray-500 font-rubik-bold mb-3 uppercase text-xs tracking-widest px-1">
              Due This Week
            </Text>
            {billsDueThisWeek.map((bill) => (
              <View
                key={bill.id}
                className={`${retro.card} p-4 mb-3 flex-row justify-between items-center border-[#FF9F1C]`}
                style={retro.shadow}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-[#FF9F1C] border-2 border-black rounded-lg items-center justify-center">
                    <Ionicons name="time" size={20} color="black" />
                  </View>
                  <View>
                    <Text className="text-black text-lg font-rubik-bold">
                      {bill.description}
                    </Text>
                    <Text className="text-gray-500 font-rubik-bold text-xs mt-1 uppercase">
                      Due Soon
                    </Text>
                  </View>
                </View>
                <Text className="text-black font-rubik-bold text-lg">
                  ${bill.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* LIST: UPCOMING & OVERDUE */}

        <View className="px-5 mb-6">
          <Text className="text-gray-500 font-rubik-bold mb-3 uppercase text-xs tracking-widest px-1">
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
                className={`${retro.card} p-4 mb-3 ${bill.isOverdue ? "border-[#FF6B6B]" : ""}`}
                style={retro.shadow}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-black text-lg font-rubik-bold">
                      {bill.description}
                    </Text>
                    <Text
                      className={`text-xs mt-1 font-rubik-bold uppercase ${bill.isOverdue ? "text-[#FF6B6B]" : "text-gray-500"}`}
                    >
                      {bill.isOverdue ? "Overdue" : "Due"}:{" "}
                      {formatDisplayDate(bill.startDate)}
                    </Text>
                  </View>

                  {/* Pay Button */}
                  <View className="items-end">
                    <Text className="text-black font-rubik-bold text-lg mb-2">
                      ${bill.amount.toFixed(2)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleMarkPaid(bill.id!)}
                      className="bg-[#A3E635] px-4 py-2 rounded-xl border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Text className="text-black font-rubik-bold text-sm uppercase">
                        Mark Paid
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </SwipeableRow>
          ))}
        </View>

        {/* LIST: PAID BILLS (Restored Feature) */}
        {paidBillsThisMonth.length > 0 && (
          <View className="px-5 pb-20">
            <Text className="text-gray-500 font-rubik-bold mb-3 uppercase text-xs tracking-widest px-1">
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
                <View
                  className={`${retro.card} p-4 mb-3 opacity-60`}
                  style={retro.shadow}
                >
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                      <View className="w-8 h-8 bg-[#A3E635] border-2 border-black rounded-lg items-center justify-center">
                        <Ionicons name="checkmark" size={16} color="black" />
                      </View>
                      <View>
                        <Text className="text-gray-600 text-lg font-rubik-bold line-through">
                          {bill.description}
                        </Text>
                        <Text className="text-gray-500 text-xs font-rubik-bold uppercase">
                          Paid
                        </Text>
                      </View>
                    </View>

                    {/* Unpay Button */}
                    <View className="items-end">
                      <Text className="text-gray-600 font-rubik-bold text-lg mb-2 line-through">
                        ${bill.amount.toFixed(2)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleMarkUnpaid(bill.id!)}
                        className="bg-gray-300 px-4 py-2 rounded-xl border-2 border-black"
                        style={retro.btnShadow}
                      >
                        <Text className="text-black font-rubik-bold text-sm uppercase">
                          Undo
                        </Text>
                      </TouchableOpacity>
                    </View>
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
