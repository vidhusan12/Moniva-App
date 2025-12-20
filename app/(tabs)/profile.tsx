import { auth } from "@/config/firebase";
import { FinanceService } from "@/services/financeService";
import { useFinanceStore } from "@/store/financeStore";
import { calculateBillTotal } from "@/utils/billUtils";
import { calculateIncomeTotal } from "@/utils/incomeUtils";
import { calculateMonthlySpending } from "@/utils/transactionUtils";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import React, { useMemo } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  color?: string;
  isLast?: boolean;
}

const MenuItem = ({
  icon,
  title,
  onPress,
  color = "white",
  isLast,
}: MenuItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center p-4 ${!isLast ? "border-b border-white/5" : ""}`}
  >
    <View className="w-10 h-10 bg-gray-800/50 rounded-full items-center justify-center mr-4">
      <Ionicons
        name={icon}
        size={20}
        color={color === "#ef4444" ? color : "#3b82f6"}
      />
    </View>
    <Text style={{ color }} className="flex-1 font-rubik-medium text-base">
      {title}
    </Text>
    <Ionicons name="chevron-forward" size={18} color="#4b5563" />
  </TouchableOpacity>
);

const profile = () => {
  const { incomes, bills, transactions } = useFinanceStore();
  const firebaseUser = auth.currentUser;

  const [realName, setRealName] = React.useState<string>("");

  // Fetch profile data when the screen loads
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      if (firebaseUser?.uid) {
        try {
          // Logic: Using the 'getItemById' from your FinanceService
          // We look in the 'users' sub-collection for a doc named 'profile'
          const profileData = await FinanceService.getItemById<{
            displayName: string;
          }>("users", firebaseUser.uid, "profile");

          if (profileData?.displayName) {
            setRealName(profileData.displayName);
          }
        } catch (error) {
          console.log("No custom profile found, using email fallback");
        }
      }
    };

    fetchUserProfile();
  }, [firebaseUser]);

  // Memoized Math
  const totalIncome = useMemo(() => calculateIncomeTotal(incomes), [incomes]);
  const totalBills = useMemo(() => calculateBillTotal(bills), [bills]);
  const totalSpent = useMemo(
    () => calculateMonthlySpending(transactions),
    [transactions]
  );

  //Split numbers for the "Big Dollar, Small Cents" UI effect
  const [incomeWhole, incomeCents] = (totalIncome || 0).toFixed(2).split(".");
  const [billWhole, billCents] = (totalBills || 0).toFixed(2).split(".");
  const [spentWhole, spentCents] = (totalSpent || 0).toFixed(2).split(".");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      Alert.alert("Error", "Could not log out");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="items-center mt-8 px-6">
          <View className="relative">
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${firebaseUser?.email || "User"}&background=0D8ABC&color=fff`,
              }}
              className="w-24 h-24 rounded-full border-2 border-blue-500"
            />
            <TouchableOpacity className="bottom-0 absolute right-0 bg-blue-500 p-2 rounded-full border-2 border-[#0a0a0a]">
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text className="text-white text-2xl font-rubik-bold mt-4">
            {realName || firebaseUser?.email?.split('@')[0] || "Guest User"}
          </Text>
          <Text className="text-gray-400 text-base font-rubik">
            {firebaseUser?.email || "No email found"}
          </Text>
        </View>

        {/* Interactive Stats Row */}
        <View className="flex-row justify-between bg-[#1a1a1a] mx-4 mt-6 p-4 rounded-2xl border border-white/5">
          {/* Saving Rate - Could lead to a 'Savings' or 'Goals' screen */}
          <TouchableOpacity
            className="items-center flex-1"
            onPress={() => router.push("/savings")}
          >
            <Text className="text-gray-400 text-[10px] font-rubik uppercase tracking-widest">
              Saved
            </Text>
            <Text className="text-blue-400 text-base font-rubik-bold mt-1">
              24%
            </Text>
          </TouchableOpacity>

          <View className="w-[1px] h-8 bg-white/10 self-center" />

          {/* Income - Navigates to income.tsx */}
          <TouchableOpacity
            className="items-center flex-1"
            onPress={() => router.push("/income")}
          >
            <Text className="text-gray-400 text-[10px] font-rubik uppercase tracking-widest">
              Income
            </Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-base font-rubik-bold">
                ${incomeWhole}
              </Text>
              <Text className="text-white text-[10px] font-rubik-medium">
                .{incomeCents}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="w-[1px] h-8 bg-white/10 self-center" />

          {/* Bills - Navigates to bill.tsx */}
          <TouchableOpacity
            className="items-center flex-1"
            onPress={() => router.push("/bill")}
          >
            <Text className="text-gray-400 text-[10px] font-rubik uppercase tracking-widest">
              Bills
            </Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-base font-rubik-bold">
                ${billWhole}
              </Text>
              <Text className="text-white text-[10px] font-rubik-medium">
                .{billCents}
              </Text>
            </View>
          </TouchableOpacity>

          <View className="w-[1px] h-8 bg-white/10 self-center" />

          {/* Spending - Navigates to transaction.tsx */}
          <TouchableOpacity
            className="items-center flex-1"
            onPress={() => router.push("/transaction")}
          >
            <Text className="text-gray-400 text-[10px] font-rubik uppercase tracking-widest">
              Spent
            </Text>
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-base font-rubik-bold">
                ${spentWhole}
              </Text>
              <Text className="text-white text-[10px] font-rubik-medium">
                .{spentCents}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Reports Section (Future Charts) */}
        <View className="px-6 mt-8">
          <Text className="text-gray-400 text-sm font-rubik-medium uppercase tracking-widest mb-4">
            Reports & Analytics
          </Text>
          <TouchableOpacity
            className="bg-[#1a1a1a] p-6 rounded-2xl border border-dashed border-gray-700 items-center justify-center"
            onPress={() => alert("Charts coming soon!")}
          >
            <Ionicons name="bar-chart-outline" size={32} color="#3b82f6" />
            <Text className="text-gray-500 font-rubik mt-2 text-center">
              Spending & Income Trends (Coming Soon)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Settings Menu */}
        <View className="px-6 mt-8 mb-10">
          <Text className="text-gray-400 text-sm font-rubik-medium uppercase tracking-widest mb-4">
            Account & App
          </Text>

          <View className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
            <MenuItem
              icon="person-outline"
              title="Account Settings"
              onPress={() => {
                Alert.alert("Coming Soon");
              }}
            />
            <MenuItem
              icon="notifications-outline"
              title="Notifications"
              onPress={() => {
                Alert.alert("Coming Soon");
              }}
            />
            <MenuItem
              icon="moon-outline"
              title="Appearance"
              onPress={() => {
                Alert.alert("Coming Soon");
              }}
            />
            <MenuItem
              icon="shield-checkmark-outline"
              title="Privacy & Security"
              onPress={() => {
                Alert.alert("Coming Soon");
              }}
            />
            <MenuItem
              icon="log-out-outline"
              title="Log Out"
              color="#ef4444"
              isLast
              onPress={() => {
                Alert.alert("Log Out", "Are you sure you want to log out?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Log Out",
                    onPress: handleLogout,
                    style: "destructive",
                  },
                ]);
              }}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;
