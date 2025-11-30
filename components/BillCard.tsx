import React from "react";
import { View, Text } from "react-native";
import { Bill } from "../services/bill";

type Props = {
  bill: Bill;
};

const BillCard: React.FC<Props> = ({ bill }) => (
  <View className="mb-4 p-4 bg-gray-800 rounded">
    <Text className="text-lg text-yellow-300">Amount: {bill.amount}</Text>
    <Text className="text-white">Description: {bill.description}</Text>
  </View>
);

export default BillCard;