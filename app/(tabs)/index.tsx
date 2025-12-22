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
import { calculateWeeklySpending } from "@/utils/transactionUtils";
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
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState, useMemo } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Dashboard = () => {
  // 1️⃣ Access Global State
  const { incomes, bills, transactions, savings, loading, loadInitialData } = useFinanceStore();
  const [userName, setUserName] = useState("Friend");
  
  // 🗓️ TIME TRAVEL STATE
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userStartDate, setUserStartDate] = useState(new Date());

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
          if (data.createdAt) setUserStartDate(parseISO(data.createdAt));
        }
      }
    };
    fetchUser();
  }, []);

  // 3️⃣ Loading State
  if (loading && bills.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a]">
        <ActivityIndicator color="#ffd33d" size="large" />
      </View>
    );
  }

  // --- 🗓️ WEEK NAVIGATION LOGIC ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const isCurrentWeek = isSameWeek(currentDate, new Date(), { weekStartsOn: 1 });
  const canGoBack = isAfter(weekStart, subWeeks(userStartDate, 1));

  const handleWeekChange = (direction: "prev" | "next") => {
    if (direction === "prev" && canGoBack) setCurrentDate(subWeeks(currentDate, 1));
    else if (direction === "next" && !isCurrentWeek) setCurrentDate(addWeeks(currentDate, 1));
  };

  // --- 📊 YOUR EXACT LOGIC (Reactive to Date) ---

  // 1. Income (Weekly)
  const weeklyIncomes = getWeeklyIncome(incomes);
  const weeklyIncome = calculateIncomeTotal(weeklyIncomes);

  // 2. Spending (Transactions THIS SELECTED WEEK)
  const transactionsThisWeek = useMemo(() => {
    return transactions.filter((t) => {
      const tDate = parseISO(t.date);
      return tDate >= weekStart && tDate <= weekEnd;
    });
  }, [transactions, weekStart, weekEnd]);

  const weeklySpending = transactionsThisWeek.reduce((sum, t) => sum + t.amount, 0);

  // 3. Bills Paid (Only count bills marked 'paid' THIS SELECTED WEEK)
  const billsPaidThisWeek = useMemo(() => {
    return bills
      .filter((b) => {
        if (b.status !== 'paid' || !b.lastPaidDate) return false;
        const paidDate = parseISO(b.lastPaidDate);
        return paidDate >= weekStart && paidDate <= weekEnd;
      })
      .reduce((total, b) => total + b.amount, 0);
  }, [bills, weekStart, weekEnd]);

  const weeklySavings = 0; // Future feature

  // 🏆 MASTER CALCULATION: Actual Cash Available
  const totalBalance = weeklyIncome - weeklySpending - billsPaidThisWeek - weeklySavings;

  // Other Stats for Widgets
  const paidBillsThisMonth = getPaidBillsThisMonth(bills);
  const billsForCurrentMonthTotal = getBillsDueCurrentMonth(bills);
  const unpaidBillsThisMonth = billsForCurrentMonthTotal.filter(
    (bill) => !paidBillsThisMonth.some((paidBill) => paidBill.id === bill.id)
  );
  const totalUnpaidAmount = calculateBillTotal(unpaidBillsThisMonth);

  const upcomingBills = getUpcomingBills(bills);

  // --- HELPER COMPONENTS ---

  const StatCard = ({ label, value, icon, color, borderColor }: any) => (
    <View className={`w-36 h-36 mr-3 p-4 rounded-[24px] justify-between bg-[#1a1a1a] border ${borderColor}`}>
        <View className={`w-10 h-10 rounded-full items-center justify-center bg-${color}-500/10`}>
            <Ionicons name={icon} size={20} color={color === "white" ? "#fff" : color} />
        </View>
        <View>
            <Text className="text-gray-500 text-[10px] uppercase font-rubik-medium tracking-widest mb-1">{label}</Text>
            <Text className={`text-xl font-rubik-bold ${color === "white" ? "text-white" : `text-${color}-500`}`}>
                {value}
            </Text>
        </View>
    </View>
  );

  const ActionButton = ({ icon, label, onPress, color }: any) => (
    <TouchableOpacity onPress={onPress} className="items-center gap-2">
      <View className={`w-14 h-14 bg-[#1a1a1a] rounded-full items-center justify-center border border-white/10`}>
        <Ionicons name={icon} size={24} color={color} /> 
      </View>
      <Text className="text-gray-400 text-[10px] font-rubik uppercase tracking-wide">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* --- HEADER --- */}
        <View className="px-6 pt-4 flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-teal-500/20 rounded-full items-center justify-center border border-teal-500/30 mr-3">
               <Text className="text-teal-400 font-rubik-bold text-lg">
                 {userName.charAt(0).toUpperCase()}
               </Text>
            </View>
            <View>
              <Text className="text-gray-400 text-xs font-rubik uppercase tracking-widest">
                Good Morning
              </Text>
              <Text className="text-white text-lg font-rubik-bold">
                {userName}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push("/profile")}>
             <Ionicons name="settings-outline" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* --- 🗓️ WEEK NAVIGATOR (RESTORED) --- */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center bg-[#1a1a1a] rounded-full p-2 border border-white/5">
            <TouchableOpacity 
              onPress={() => handleWeekChange("prev")}
              className={`w-10 h-10 rounded-full items-center justify-center ${canGoBack ? "bg-white/5" : "opacity-30"}`}
              disabled={!canGoBack}
            >
              <Ionicons name="chevron-back" size={20} color="white" />
            </TouchableOpacity>

            <View className="items-center">
              <Text className="text-white font-rubik-medium text-sm">
                {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d")}
              </Text>
              <Text className="text-gray-500 text-[10px] font-rubik uppercase tracking-widest mt-0.5">
                {isCurrentWeek ? "Current Week" : "Past Week"}
              </Text>
            </View>

            <TouchableOpacity 
              onPress={() => handleWeekChange("next")}
              className={`w-10 h-10 rounded-full items-center justify-center ${!isCurrentWeek ? "bg-white/5" : "opacity-30"}`}
              disabled={isCurrentWeek}
            >
              <Ionicons name="chevron-forward" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- HERO CARD (Available Balance) --- */}
        <View className="px-6 mb-8">
          <View className="bg-[#1a1a1a] rounded-[32px] p-7 border border-white/5 relative overflow-hidden">
            {/* Ambient Glow */}
            <View className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-[60px] -mr-10 -mt-10" />
            
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-gray-400 text-xs font-rubik uppercase tracking-widest">
                Available Balance
                </Text>
                {isCurrentWeek && (
                    <View className="flex-row items-center bg-white/5 px-3 py-1 rounded-full">
                        <View className="w-2 h-2 rounded-full bg-teal-500 mr-2 animate-pulse" />
                        <Text className="text-white text-[10px] font-rubik">Live</Text>
                    </View>
                )}
            </View>
            
            <View className="flex-row items-baseline mt-2">
              <Text className={`text-6xl font-rubik-bold ${totalBalance < 0 ? "text-red-500" : "text-white"}`}>
                ${Math.floor(totalBalance).toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-2xl font-rubik-medium ml-1">
                .{(Math.abs(totalBalance) % 1).toFixed(2).substring(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* --- QUICK ACTIONS --- */}
        <View className="px-6 mb-10">
          <View className="flex-row justify-between px-2">
            <ActionButton 
              icon="swap-horizontal" 
              label="Expense" 
              onPress={() => router.push("/newTransaction")} 
              color="#f97316"
            />
            <ActionButton 
              icon="receipt" 
              label="Bill" 
              onPress={() => router.push("/newBill")} 
              color="#3b82f6"
            />
            <ActionButton 
              icon="trending-up" 
              label="Income" 
              onPress={() => router.push("/newIncome")} 
              color="#2dd4bf"
            />
            <ActionButton 
              icon="wallet" 
              label="Goal" 
              onPress={() => router.push("/newSavings")} 
              color="#a855f7"
            />
          </View>
        </View>

        {/* --- INSIGHTS SCROLL --- */}
        <View className="pl-6 mb-10">
          <Text className="text-white font-rubik-bold text-lg mb-4">Weekly Pulse</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pr-6">
            
            <StatCard 
                label="Weekly Income"
                value={`$${weeklyIncome.toFixed(0)}`}
                icon="arrow-up-circle"
                color="teal"
                borderColor="border-teal-500/20"
            />

            <StatCard 
                label="Spent (Week)"
                value={`$${weeklySpending.toFixed(0)}`}
                icon="cart"
                color="orange"
                borderColor="border-orange-500/20"
            />

            <StatCard 
                label="Bills Paid"
                value={`$${billsPaidThisWeek.toFixed(0)}`}
                icon="checkmark-done-circle"
                color="blue"
                borderColor="border-blue-500/20"
            />

            <StatCard 
                label="Unpaid Bills"
                value={`$${totalUnpaidAmount.toFixed(0)}`}
                icon="alert-circle"
                color="red"
                borderColor="border-red-500/20"
            />

            <View className="w-6" />
          </ScrollView>
        </View>

        {/* --- 🏦 SAVINGS GOALS (RESTORED) --- */}
        {savings.length > 0 && (
          <View className="px-6 mb-8">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-rubik-bold text-lg">Savings Goals</Text>
                <TouchableOpacity onPress={() => router.push("/savings")}>
                    <Text className="text-teal-500 text-xs font-rubik">See All</Text>
                </TouchableOpacity>
            </View>
            
            {savings.slice(0, 3).map((goal) => {
              const progress = goal.targetAmount > 0 
                ? Math.min(100, ((goal.currentAmount || 0) / goal.targetAmount) * 100) 
                : 0;
              
              return (
                <View key={goal.id} className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-white/5">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-white font-rubik-medium">{goal.name}</Text>
                    <Text className="text-teal-400 font-rubik-bold text-xs">
                       ${(goal.currentAmount || 0).toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </Text>
                  </View>
                  <View className="h-2 bg-black rounded-full overflow-hidden border border-white/5">
                    <View 
                      style={{ width: `${progress}%` }} 
                      className="h-full bg-teal-500 rounded-full" 
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* --- RECENT SPENDING --- */}
        <View className="px-6 mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white font-rubik-bold text-lg">Recent Spending</Text>
            <TouchableOpacity onPress={() => router.push("/transaction")}>
                <Text className="text-teal-500 text-xs font-rubik">See All</Text>
            </TouchableOpacity>
          </View>
          {transactionsThisWeek.length === 0 ? (
             <View className="bg-[#1a1a1a] rounded-2xl p-6 items-center border border-white/5">
                <Text className="text-gray-500 font-rubik">No spending this week</Text>
             </View>
          ) : (
            transactionsThisWeek.slice(0, 5).map((t) => (
                <View key={t.id} className="bg-[#1a1a1a] rounded-2xl p-4 mb-3 border border-white/5 flex-row justify-between items-center">
                    <View className="flex-row items-center gap-3">
                        <View className="w-10 h-10 bg-white/5 rounded-full items-center justify-center">
                            <Ionicons name="receipt-outline" size={18} color="#9ca3af" />
                        </View>
                        <View>
                            <Text className="text-white font-rubik-medium">{t.description}</Text>
                            <Text className="text-gray-500 text-xs mt-0.5">{t.category}</Text>
                        </View>
                    </View>
                    <Text className="text-white font-rubik-bold">-${t.amount.toFixed(2)}</Text>
                </View>
            ))
          )}
        </View>

        {/* --- UPCOMING BILLS --- */}
        {upcomingBills.length > 0 && (
          <View className="px-6 pb-20">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-white font-rubik-bold text-lg">Upcoming Bills</Text>
                <TouchableOpacity onPress={() => router.push("/bill")}>
                    <Text className="text-blue-500 text-xs font-rubik">See All</Text>
                </TouchableOpacity>
            </View>
            {upcomingBills.map((bill) => (
              <View
                key={bill.id}
                className="bg-[#1a1a1a] border border-orange-600/20 rounded-2xl p-4 w-full mb-3 flex-row justify-between items-center"
              >
                <View className="flex-row items-center gap-3">
                     <View className="w-10 h-10 bg-orange-500/10 rounded-full items-center justify-center">
                        <Ionicons name="alert-circle-outline" size={18} color="#f97316" />
                    </View>
                    <View>
                        <Text className="font-rubik-medium text-base text-white">
                        {bill.description}
                        </Text>
                        <Text className="text-xs text-orange-400 mt-1">
                        Due: {formatDisplayDate(bill.startDate)}
                        </Text>
                    </View>
                </View>
                <Text className="font-rubik-semibold text-lg text-white">
                  ${bill.amount.toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Dashboard;