import React from "react";
import { View, Text } from "react-native";
import { Income } from "../services/income";

type Props = {
  income: Income;
};

const IncomeCard: React.FC<Props> = ({ income }) => (
  <View className="mb-4 p-4 bg-gray-800 rounded">
    <Text className="text-lg text-yellow-300">Amount: {income.amount}</Text>
    <Text className="text-white">Description: {income.description}</Text>
  </View>
);

export default IncomeCard;