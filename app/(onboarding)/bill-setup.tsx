import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
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
import { useUser } from "../../app/context/UserContext";

const FREQUENCIES = ["Weekly", "Fortnightly", "Monthly"];

export default function BillSetup() {
  const { bills, addBill, removeBill } = useUser();

  // Modal State
  const [isModalVisible, setModalVisible] = useState(false);

  // Form State
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [freq, setFreq] = useState("Monthly");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddBill = () => {
    if (!desc || !amount) return;

    addBill({
      id: Date.now().toString(),
      description: desc,
      amount: amount,
      frequency: freq,
      date: date,
    });

    // Reset Form & Close Modal
    setDesc("");
    setAmount("");
    setFreq("Monthly");
    setDate(new Date());
    setModalVisible(false);
  };

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  // The Smart Formatter Logic
  const handleAmountChange = (text: string) => {
    // 1. Remove junk (letters, symbols like / * -)
    let cleaned = text.replace(/[^0-9.]/g, "");

    // 2. Prevent double dots (e.g. 10.5.5)
    const dots = cleaned.split(".").length - 1;
    if (dots > 1) return;

    // 3. Format with commas
    if (cleaned.endsWith(".")) {
      setAmount(cleaned); // Allow "100." while typing
    } else if (cleaned.includes(".")) {
      const [integer, decimal] = cleaned.split(".");
      setAmount(`${Number(integer).toLocaleString()}.${decimal}`);
    } else {
      setAmount(cleaned === "" ? "" : Number(cleaned).toLocaleString());
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black justify-between">
      <StatusBar style="light" />

      {/* HEADER */}
      <View className="px-6 mt-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-white/10 rounded-full"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>

        {/* Progress Bar: Step 3 */}
        <View className="flex-row space-x-2">
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
        </View>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-white text-3xl font-rubik-bold">
          Recurring Bills
        </Text>
        <Text className="text-gray-400 text-base mt-2">
          Add your fixed expenses like Rent, Netflix, or Gym.
        </Text>
      </View>

      {/* LIST OF BILLS */}
      <ScrollView className="flex-1 px-6 mt-6">
        {bills.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons name="receipt-outline" size={64} color="gray" />
            <Text className="text-gray-500 mt-4">No bills added yet.</Text>
          </View>
        ) : (
          bills.map((item) => (
            <View
              key={item.id}
              className="bg-[#1a1a1a] p-4 rounded-xl mb-3 flex-row justify-between items-center border border-white/5"
            >
              <View>
                <Text className="text-white font-rubik-medium text-lg">
                  {item.description}
                </Text>
                {/* Full Date Format (e.g. 22/12/2025) */}
                <Text className="text-gray-400 text-xs mt-1">
                  {item.frequency} • {item.date.toLocaleDateString("en-GB")}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-white font-rubik-bold text-lg mr-4">
                  ${Number(item.amount).toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => removeBill(item.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* Add Button */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="flex-row items-center justify-center bg-white/5 border border-white/10 p-4 rounded-xl border-dashed mt-2 mb-10"
        >
          <Ionicons name="add" size={24} color="white" />
          <Text className="text-white font-rubik-medium ml-2">Add a Bill</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View className="px-6 mb-4">
        <TouchableOpacity
          onPress={() => router.push("/(onboarding)/saving-setup")}
          className="w-full py-5 rounded-full items-center bg-teal-500"
        >
          <Text className="text-white font-rubik-bold text-lg">
            {bills.length === 0 ? "Skip for Now" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ADD BILL MODAL --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#1a1a1a] rounded-t-3xl p-6 border-t border-white/10 h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-rubik-bold">
                  New Bill
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <TextInput
                placeholder="Description (e.g. Rent)"
                placeholderTextColor="#666"
                className="bg-black/50 text-white p-4 rounded-xl mb-4 text-lg font-rubik border border-white/5"
                value={desc}
                onChangeText={setDesc}
                autoFocus
              />

              <TextInput
                placeholder="Amount"
                placeholderTextColor="#666"
                keyboardType="numeric"
                className="bg-black/50 text-white p-4 rounded-xl mb-4 text-lg font-rubik border border-white/5"
                value={amount}
                onChangeText={handleAmountChange}
              />

              {/* Frequency Row */}
              <View className="flex-row justify-between mb-4">
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFreq(f)}
                    className={`px-3 py-3 rounded-xl border ${freq === f ? "bg-teal-500/20 border-teal-500" : "bg-black/30 border-transparent"}`}
                  >
                    <Text
                      className={`font-rubik-medium ${freq === f ? "text-teal-400" : "text-gray-400"}`}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Button */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-black/50 p-4 rounded-xl mb-6 flex-row justify-between border border-white/5 items-center"
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#666"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-gray-400 text-base">Due Date</Text>
                </View>
                <Text className="text-white font-rubik-medium text-lg">
                  {date.toLocaleDateString("en-GB", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </Text>
              </TouchableOpacity>

              {/* iOS Date Picker Logic  */}
              {showDatePicker &&
                (Platform.OS === "ios" ? (
                  <View className="absolute top-20 left-4 right-4 bg-[#252525] p-4 rounded-2xl border border-gray-700 z-50 shadow-2xl">
                    <Text className="text-white font-rubik-bold text-center mb-4">
                      Select Due Date
                    </Text>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="inline"
                      onChange={onDateChange}
                      themeVariant="dark"
                      accentColor="#2dd4bf"
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-teal-500 py-3 rounded-xl items-center"
                    >
                      <Text className="text-black font-rubik-bold">Done</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                  />
                ))}

              <View className="flex-1" />

              <TouchableOpacity
                onPress={handleAddBill}
                className={`w-full py-4 rounded-full items-center mb-6 ${desc && amount ? "bg-teal-500" : "bg-gray-800"}`}
                disabled={!desc || !amount}
              >
                <Text
                  className={`font-rubik-bold text-lg ${desc && amount ? "text-white" : "text-gray-500"}`}
                >
                  Add Bill
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
