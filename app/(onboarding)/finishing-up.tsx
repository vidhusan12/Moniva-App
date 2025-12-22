import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebase"; // Ensure db is exported from config
import { useUser } from "../../app/context/UserContext";
import { FinanceService } from "../../services/financeService";

export default function FinishingUp() {
  const {
    balance,
    incomeAmount,
    incomeFrequency,
    incomeDescription,
    nextPayDate,
    bills,
    savings,
  } = useUser();

  const [status, setStatus] = useState("Setting up your wallet...");

  useEffect(() => {
    const saveData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // 1. Save User Profile & Balance
        // update the user's main document with their current balance and a flag saying they finished onboarding
        setStatus("Securing your balance...");
        const userRef = doc(db, "users", user.uid);

        // use setDoc with { merge: true } so we don't overwrite existing user data (like name/email)
        await setDoc(
          userRef,
          {
            currentBalance: parseFloat(balance.replace(/,/g, "")), // Clean "1,000" -> 1000
            isOnboardingComplete: true,
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );

        // 2. Save Income (If they added one)
        if (incomeAmount) {
          setStatus("Adding income source...");
          await FinanceService.addItem("incomes", user.uid, {
            amount: parseFloat(incomeAmount.replace(/,/g, "")),
            description: incomeDescription || "Primary Income",
            frequency: incomeFrequency,
            startDate: nextPayDate.toISOString(),
            date: nextPayDate.toISOString(),
            userId: user.uid,
          });
        }

        // 3. Save Bills (Loop through the list)
        if (bills.length > 0) {
          setStatus(`Scheduling ${bills.length} bills...`);
          // We use Promise.all to save them ALL at once, not one by one. Much faster!
          const billPromises = bills.map((bill) =>
            FinanceService.addItem("bills", user.uid, {
              amount: parseFloat(bill.amount.replace(/,/g, "")),
              description: bill.description,
              frequency: bill.frequency,
              startDate: bill.date.toISOString(),
              date: bill.date.toISOString(),
              status: "unpaid",
              userId: user.uid,
            })
          );
          await Promise.all(billPromises);
        }

        // 4. Save Savings Goals
        if (savings.length > 0) {
          setStatus(`Creating ${savings.length} saving goals...`);
          const savingPromises = savings.map((goal) =>
            FinanceService.addItem("savings", user.uid, {
              name: goal.name,
              targetAmount: parseFloat(goal.targetAmount.replace(/,/g, "")),
              currentAmount: 0, // Start at 0
              userId: user.uid,
            })
          );
          await Promise.all(savingPromises);
        }

        // 5. Done! Redirect to the main app (Tabs)
        setStatus("All done!");
        setTimeout(() => {
          router.replace("/(tabs)");
        }, 1000); // Small delay so they see the "Success" message
      } catch (error) {
        console.error("Error saving data:", error);
        setStatus("Error saving data. Please restart.");
      }
    };

    saveData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black justify-center items-center px-6">
      <StatusBar style="light" />

      <ActivityIndicator size="large" color="#2dd4bf" className="mb-8" />

      <Text className="text-white text-2xl font-rubik-bold text-center mb-2">
        Setting up Moniva
      </Text>

      <Text className="text-gray-400 font-rubik text-base text-center">
        {status}
      </Text>
    </SafeAreaView>
  );
}
