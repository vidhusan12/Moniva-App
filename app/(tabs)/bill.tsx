import { addBilll } from "@/services/bill";
import React, { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Bill = () => {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || isNaN(parsedAmount) || description.trim() === "") {
      Alert.alert("Error", "Enter a valid amount and description");
      return;
    }

    try {
      await addBilll({
        amount: parsedAmount,
        description: description.trim(),
      });
      Alert.alert("Success", "Bill added!");
      setAmount("");
      setDescription("");
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Unknown error"
      );
    }
  };

  return (
    <SafeAreaView>
      <View>
        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />
        <Button title="Add Bill" onPress={handleSubmit} />
      </View>
    </SafeAreaView>
  );
};

export default Bill;
