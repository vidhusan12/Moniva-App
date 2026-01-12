import { auth, db } from "@/config/firebase";
import { useFinanceStore } from "@/store/financeStore";
import {
  calculateBillTotal,
  getBillsDueCurrentMonth,
  getPaidBillsThisMonth,
  getUpcomingBills,
} from "@/utils/billUtils";
import { formatDisplayDate } from "@/utils/dateFormatting";
import { calculateIncomeTotal, getWeeklyIncome } from "@/utils/incomeUtils";
import { calculateTotalSavings } from "@/utils/savingsUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  addWeeks,
  endOfWeek,
  format,
  isAfter,
  isSameWeek,
  parseISO,
  startOfWeek,
  subWeeks,
} from "date-fns";
import { router } from "expo-router";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ✨ RETRO DESIGN SYSTEM
const retro = {
  bg: "bg-[#FFFDF5]", // Off-white paper background
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

const Dashboard = () => {
  // 1️⃣ Access Global State
  const { incomes, bills, transactions, savings, loading, loadInitialData } =
    useFinanceStore();
  const [userName, setUserName] = useState("Friend");
  const [userBalance, setUserBalance] = useState(0);

  // 🗓️ TIME TRAVEL STATE
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userStartDate, setUserStartDate] = useState(new Date());

  // 💰 BALANCE EDIT MODAL STATE
  const [isBalanceModalVisible, setBalanceModalVisible] = useState(false);
  const [editBalance, setEditBalance] = useState("");
  const [balanceLoading, setBalanceLoading] = useState(false);

  // Fetch User Name & Start Date
  useEffect(() => {
    loadInitialData();
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserName(data.displayName || "Friend");
          setUserBalance(data.currentBalance || 0);
          if (data.createdAt) setUserStartDate(parseISO(data.createdAt));
        }
      }
    };
    fetchUser();
  }, []);

  // 3️⃣ Loading State
  if (loading && bills.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FFFDF5]">
        <ActivityIndicator color="#000" size="large" />
      </View>
    );
  }

  // --- 🗓️ WEEK NAVIGATION LOGIC ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentDate, new Date(), {
    weekStartsOn: 1,
  });
  const canGoBack = isAfter(weekStart, subWeeks(userStartDate, 1));

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev" && canGoBack)
      setCurrentDate(subWeeks(currentDate, 1));
    else if (direction === "next" && !isCurrentWeek)
      setCurrentDate(addWeeks(currentDate, 1));
  };

  const canGoForward = !isCurrentWeek; // Can go forward if NOT currently viewing this week

  // --- 📊 YOUR EXACT LOGIC (Reactive to Date) ---

  // 1. Income (Weekly) - THIS WEEK ONLY (for display in widget)
  const weeklyIncomes = getWeeklyIncome(incomes, weekStart, weekEnd);
  const weeklyIncome = calculateIncomeTotal(weeklyIncomes);

  // 2. Spending (Transactions THIS SELECTED WEEK)
  const transactionsThisWeek = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = parseISO(t.date);
      return tDate >= weekStart && tDate <= weekEnd;
    });
  }, [transactions, weekStart, weekEnd]);

  const weeklySpending = transactionsThisWeek.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // 3. Bills Paid (Only count bills marked 'paid' THIS SELECTED WEEK)
  const billsPaidThisWeek = useMemo(() => {
    return bills
      .filter((b) => {
        if (b.status !== "paid" || !b.lastPaidDate) return false;
        const paidDate = parseISO(b.lastPaidDate);
        return paidDate >= weekStart && paidDate <= weekEnd;
      })
      .reduce((total, b) => total + b.amount, 0);
  }, [bills, weekStart, weekEnd]);

  // 4. Savings (kept for display, but NOT subtracted from available cash)
  // Savings are separate - user should adjust their balance when moving money to savings
  const totalCurrentSavings = useMemo(() => {
    return calculateTotalSavings(savings);
  }, [savings]);

  // 🏆 AVAILABLE CASH CALCULATION (Like a Bank Account)
  // This is CUMULATIVE from start date up to the selected week

  // All income received from start up to end of selected week
  const totalIncomeUpToWeek = useMemo(() => {
    const allIncomes = getWeeklyIncome(incomes, userStartDate, weekEnd);
    return calculateIncomeTotal(allIncomes);
  }, [incomes, userStartDate, weekEnd]);

  // All spending from start up to end of selected week
  const totalSpendingUpToWeek = useMemo(() => {
    return transactions
      .filter((t) => {
        const tDate = parseISO(t.date);
        return tDate >= userStartDate && tDate <= weekEnd;
      })
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions, userStartDate, weekEnd]);

  // All bills paid from start up to end of selected week
  const totalBillsPaidUpToWeek = useMemo(() => {
    return bills
      .filter((b) => {
        if (b.status !== "paid" || !b.lastPaidDate) return false;
        const paidDate = parseISO(b.lastPaidDate);
        return paidDate >= userStartDate && paidDate <= weekEnd;
      })
      .reduce((total, b) => total + b.amount, 0);
  }, [bills, userStartDate, weekEnd]);

  // Available Cash = Starting Balance + All Income - All Spending - All Bills Paid
  const totalBalance =
    userBalance +
    totalIncomeUpToWeek -
    totalSpendingUpToWeek -
    totalBillsPaidUpToWeek;

  // Other Stats for Widgets
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);
  const billsForCurrentMonthTotal = getBillsDueCurrentMonth(bills);
  const unpaidBillsThisMonth = billsForCurrentMonthTotal.filter(
    (bill) => !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
  );
  const totalUnpaidAmount = calculateBillTotal(unpaidBillsThisMonth);

  const upcomingBills = getUpcomingBills(bills);

  // 💰 BALANCE EDIT HANDLERS
  const openBalanceModal = () => {
    setEditBalance(totalBalance.toFixed(2));
    setBalanceModalVisible(true);
  };

  const handleBalanceChange = (text: string) => {
    let cleaned = text.replace(/[^0-9.]/g, "");
    if (cleaned.split(".").length > 2) return;
    setEditBalance(cleaned);
  };

  const handleSaveBalance = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newBalance = parseFloat(editBalance) || 0;

    // Calculate what the starting balance should be to reach this current balance
    // newStartingBalance = currentBalance - totalIncome + totalSpending + totalBillsPaid
    const newStartingBalance =
      newBalance -
      totalIncomeUpToWeek +
      totalSpendingUpToWeek +
      totalBillsPaidUpToWeek;

    setBalanceLoading(true);
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { currentBalance: newStartingBalance },
        { merge: true }
      );
      setUserBalance(newStartingBalance);
      setBalanceModalVisible(false);
      Alert.alert("Success", "Balance updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update balance");
    } finally {
      setBalanceLoading(false);
    }
  };

  // --- HELPER COMPONENTS ---

  const StatCard = ({ label, value, icon, color, bgColor }: any) => (
    <View
      className={`w-36 h-36 mr-3 p-4 rounded-xl justify-between border-2 border-black ${bgColor || "bg-white"}`}
      style={retro.btnShadow}
    >
      <View
        className={`w-10 h-10 rounded-lg items-center justify-center border-2 border-black bg-white`}
      >
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View>
        <Text className="text-black/60 text-[10px] uppercase font-rubik-medium tracking-widest mb-1">
          {label}
        </Text>
        <Text className="text-xl font-rubik-bold text-black">{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-20 right-8 w-16 h-16 bg-[#ffd33d] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-48 left-10 w-10 h-10 bg-[#10b981] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-40 right-12 w-12 h-12 bg-[#a855f7] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* --- 1. HEADER & DATE --- */}
        <View className="px-6 pt-2 pb-4 flex-col mb-2">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="font-rubik-medium text-gray-500 text-xs uppercase tracking-wider">
                Good Morning,
              </Text>
              <Text className="font-rubik-bold text-2xl text-black">
                {userName}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/more")}
              className="w-10 h-10 bg-[#3b82f6] border-2 border-black rounded-lg items-center justify-center"
              style={retro.btnShadow}
            >
              <Ionicons name="settings-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>

          <View
            className="flex-row items-center bg-white border-2 border-black rounded-lg p-1.5 gap-3 self-start"
            style={retro.btnShadow}
          >
            <TouchableOpacity
              onPress={() => handleWeekChange("prev")}
              disabled={!canGoBack}
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={canGoBack ? "black" : "#ccc"}
              />
            </TouchableOpacity>
            <Text className="font-rubik-bold text-xs uppercase min-w-[70px] text-center text-black">
              {isCurrentWeek ? "This Week" : format(weekStart, "MMM d")}
            </Text>
            <TouchableOpacity
              onPress={() => handleWeekChange("next")}
              disabled={isCurrentWeek}
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={canGoForward ? "black" : "#ccc"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 2. BALANCE TICKET --- */}
        <View className="px-6 mb-8">
          <TouchableOpacity
            onPress={openBalanceModal}
            activeOpacity={0.8}
            className={`${retro.card} bg-[#A3E635] p-5 relative overflow-hidden`}
            style={retro.shadow}
          >
            {/* Ticket Cutouts for Style */}
            <View className="absolute -left-3 top-1/2 w-6 h-6 bg-[#FFFDF5] rounded-full border-2 border-black" />
            <View className="absolute -right-3 top-1/2 w-6 h-6 bg-[#FFFDF5] rounded-full border-2 border-black" />

            <View className="flex-row justify-between items-start mb-1 px-2">
              <Text className="font-rubik-bold text-xs uppercase tracking-widest text-black">
                Available Cash
              </Text>
              {isCurrentWeek && (
                <View className="flex-row items-center bg-black px-2 py-0.5 rounded-md">
                  <Text className="text-[#A3E635] text-[10px] font-rubik-bold">
                    LIVE
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-baseline mt-1 px-2">
              <Text
                className={`text-5xl font-rubik-bold tracking-tighter ${totalBalance < 0 ? "text-red-600" : "text-black"}`}
              >
                ${Math.floor(totalBalance).toLocaleString()}
              </Text>
              <Text className="text-xl text-black/60 font-rubik-medium ml-1">
                .{(Math.abs(totalBalance) % 1).toFixed(2).substring(2)}
              </Text>
              <Ionicons
                name="create-outline"
                size={20}
                color="black"
                style={{ marginLeft: 8, opacity: 0.5 }}
              />
            </View>
          </TouchableOpacity>
        </View>

        {/* --- 3. QUICK ACTIONS (Bento Grid) --- */}
        <View className="px-6 mb-8">
          <Text className="font-rubik-bold text-sm mb-3 uppercase opacity-50 ml-1">
            Quick Actions
          </Text>
          <View className="flex-row justify-between gap-3">
            <TouchableOpacity
              onPress={() => router.push("/newTransaction")}
              className={`flex-1 bg-[#FF90E8] h-20 items-center justify-center ${retro.card}`}
              style={retro.btnShadow}
            >
              <Ionicons name="card-outline" size={24} color="black" />
              <Text className="font-rubik-bold text-[10px] uppercase mt-1 text-black">
                Spend
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/newIncome")}
              className={`flex-1 bg-[#2EC4B6] h-20 items-center justify-center ${retro.card}`}
              style={retro.btnShadow}
            >
              <Ionicons name="cash-outline" size={24} color="black" />
              <Text className="font-rubik-bold text-[10px] uppercase mt-1 text-black">
                Earn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/newBill")}
              className={`flex-1 bg-white h-20 items-center justify-center ${retro.card}`}
              style={retro.btnShadow}
            >
              <Ionicons name="receipt-outline" size={24} color="black" />
              <Text className="font-rubik-bold text-[10px] uppercase mt-1 text-black">
                Bill
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/newSavings")}
              className={`flex-1 bg-white h-20 items-center justify-center ${retro.card}`}
              style={retro.btnShadow}
            >
              <Ionicons name="heart-outline" size={24} color="black" />
              <Text className="font-rubik-bold text-[10px] uppercase mt-1 text-black">
                Goal
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 4. WEEKLY PULSE (Stats) --- */}
        <View className="pl-6 mb-8">
          <Text className="font-rubik-bold text-sm mb-3 uppercase opacity-50 ml-1">
            Weekly Pulse
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pr-6"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            <StatCard
              label="Income"
              value={`$${weeklyIncome.toFixed(0)}`}
              icon="arrow-up"
              color="#2EC4B6"
            />

            <StatCard
              label="Spent"
              value={`$${weeklySpending.toFixed(0)}`}
              icon="cart"
              color="#FF9F1C"
            />

            <StatCard
              label="Bills Paid"
              value={`$${billsPaidThisWeek.toFixed(0)}`}
              icon="checkmark"
              color="#3B82F6"
            />

            <StatCard
              label="Unpaid Bills"
              value={`$${totalUnpaidAmount.toFixed(0)}`}
              icon="alert-circle"
              color="#EF4444"
            />
          </ScrollView>
        </View>

        {/* --- 5. SAVINGS GOALS (Restored) --- */}
        {savings.length > 0 && (
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-rubik-bold text-sm uppercase opacity-50 ml-1">
                Savings Goals
              </Text>
              <TouchableOpacity onPress={() => router.push("/savings")}>
                <Text className="text-black text-xs font-rubik-bold underline">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {savings.slice(0, 3).map((goal) => {
              const progress =
                goal.targetAmount > 0
                  ? Math.min(
                      100,
                      ((goal.currentAmount || 0) / goal.targetAmount) * 100
                    )
                  : 0;

              return (
                <View
                  key={goal.id}
                  className={`p-4 mb-3 ${retro.card}`}
                  style={retro.btnShadow}
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-black font-rubik-bold">
                      {goal.name}
                    </Text>
                    <Text className="text-gray-500 font-rubik-bold text-xs">
                      ${(goal.currentAmount || 0).toLocaleString()} / $
                      {goal.targetAmount.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-3 bg-gray-100 rounded-full overflow-hidden border-2 border-black">
                    <View
                      style={{ width: `${progress}%` }}
                      className="h-full bg-[#FF90E8] border-r-2 border-black"
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* --- 6. RECENT SPENDING (List) --- */}
        <View className="px-6 mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="font-rubik-bold text-sm uppercase opacity-50 ml-1">
              Recent Spending
            </Text>
            <TouchableOpacity onPress={() => router.push("/transaction")}>
              <Text className="text-black text-xs font-rubik-bold underline">
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {transactionsThisWeek.length === 0 ? (
            <View className="border-2 border-black border-dashed rounded-xl p-8 items-center bg-black/5">
              <Text className="font-rubik-medium text-gray-500 uppercase text-xs">
                No spending this week
              </Text>
            </View>
          ) : (
            transactionsThisWeek.slice(0, 5).map((t) => (
              <View
                key={t.id}
                className={`flex-row justify-between items-center p-4 mb-3 ${retro.card}`}
                style={retro.btnShadow}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-gray-50 rounded-lg border-2 border-black items-center justify-center">
                    <Ionicons name="pricetag" size={18} color="black" />
                  </View>
                  <View>
                    <Text className="font-rubik-bold text-black text-sm">
                      {t.description}
                    </Text>
                    <Text className="text-gray-500 text-xs font-rubik-medium mt-0.5">
                      {format(parseISO(t.date), "MMM d")} • {t.category}
                    </Text>
                  </View>
                </View>
                <Text className="font-rubik-bold text-black text-sm">
                  -${t.amount.toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* --- 7. UPCOMING BILLS (Restored) --- */}
        {upcomingBills.length > 0 && (
          <View className="px-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="font-rubik-bold text-sm uppercase opacity-50 ml-1">
                Upcoming Bills
              </Text>
              <TouchableOpacity onPress={() => router.push("/bill")}>
                <Text className="text-black text-xs font-rubik-bold underline">
                  See All
                </Text>
              </TouchableOpacity>
            </View>

            {upcomingBills.map((bill) => (
              <View
                key={bill.id}
                className={`flex-row justify-between items-center p-4 mb-3 bg-[#1a1a1a] border-2 border-black rounded-xl`}
                style={retro.btnShadow}
              >
                <View className="flex-row items-center gap-3">
                  <View className="w-10 h-10 bg-orange-500 rounded-lg border-2 border-white/20 items-center justify-center">
                    <Ionicons name="alert-circle" size={20} color="white" />
                  </View>
                  <View>
                    <Text className="font-rubik-bold text-white text-sm">
                      {bill.description}
                    </Text>
                    <Text className="text-xs text-orange-400 font-rubik-medium mt-1">
                      Due: {formatDisplayDate(bill.startDate)}
                    </Text>
                  </View>
                </View>
                <Text className="font-rubik-bold text-white text-base">
                  ${bill.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* BALANCE EDIT MODAL */}
      <Modal visible={isBalanceModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback
            onPress={() => setBalanceModalVisible(false)}
          >
            <View className="flex-1 bg-black/80 justify-end">
              <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View className="bg-[#FFFDF5] rounded-t-3xl p-6 border-t-4 border-[#10b981] max-h-[50%]">
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-black text-xl font-rubik-bold uppercase tracking-tight">
                      Edit Balance
                    </Text>
                    <TouchableOpacity
                      onPress={() => setBalanceModalVisible(false)}
                      className="w-8 h-8 bg-[#ef233c] rounded-full items-center justify-center border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  </View>

                  <Text className="text-gray-500 font-rubik-medium mb-4">
                    Update your available cash balance
                  </Text>

                  <View
                    className="bg-white rounded-xl border-2 border-black p-4 mb-4 flex-row items-center"
                    style={retro.btnShadow}
                  >
                    <Text className="text-black text-2xl font-rubik-bold mr-2">
                      $
                    </Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor="#999"
                      value={editBalance}
                      onChangeText={handleBalanceChange}
                      keyboardType="decimal-pad"
                      className="flex-1 text-black font-rubik-bold text-2xl"
                      style={{ paddingVertical: 0 }}
                      autoFocus
                    />
                  </View>

                  <TouchableOpacity
                    onPress={handleSaveBalance}
                    disabled={balanceLoading}
                    className={`w-full py-4 rounded-xl items-center bg-[#10b981] border-2 border-black ${
                      balanceLoading ? "opacity-70" : ""
                    }`}
                    style={retro.btnShadow}
                  >
                    {balanceLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
                        Save Balance
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Dashboard;
