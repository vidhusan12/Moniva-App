import { Bill } from "@/services/bill";
import { FlatList, Text } from "react-native";
import BillCard from "./BillCard";

type Props = {
  bills: Bill[];
};

const BillList: React.FC<Props> = ({ bills }) => (
  <FlatList
    data={bills}
    keyExtractor={(_, idx) => idx.toString()}
    renderItem={({ item }) => <BillCard bill={item} />}
    ListEmptyComponent={
      <Text className="text-white">No income entries found.</Text>
    }
  />
);

export default BillList;
