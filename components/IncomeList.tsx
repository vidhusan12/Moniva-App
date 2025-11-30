import React from "react";
import { FlatList, Text } from "react-native";
import { Income } from "../services/income";
import IncomeCard from "./IncomeCard";

type Props = {
  incomes: Income[];
};

const IncomeList: React.FC<Props> = ({ incomes }) => (
  <FlatList
    data={incomes}
    keyExtractor={(_, idx) => idx.toString()}
    renderItem={({ item }) => <IncomeCard income={item} />}
    ListEmptyComponent={
      <Text className="text-white">No income entries found.</Text>
    }
  />
);

export default IncomeList;
