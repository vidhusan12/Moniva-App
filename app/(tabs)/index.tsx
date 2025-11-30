import BillList from "@/components/BillList";
import { Bill, fetchAllBill } from "@/services/bill";
import { useFocusEffect } from "@react-navigation/native"; // Add this import
import React, { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import IncomeList from "../../components/IncomeList";
import { fetchAllIncome, Income } from "../../services/income";

const index = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadIncomes = async () => {
        try {
          setLoading(true); // Show loading when refetching
          const data = await fetchAllIncome();
          const billData = await fetchAllBill();
          setIncomes(data);
          setBills(billData);
        } finally {
          setLoading(false);
        }
      };
      loadIncomes();
    }, [])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#ffffff] px-4 pt-8">
      <Text className="text-3xl text-black-300 mb-4">Home</Text>
      <IncomeList incomes={incomes} />
      <BillList bills={bills} />
    </View>
  );
};

export default index;
