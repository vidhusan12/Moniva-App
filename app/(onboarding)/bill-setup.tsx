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
  const retro = {
    bg: "bg-[#FFFDF5]",
    card: "bg-white rounded-xl border-2 border-black",
    shadow: {
      shadowColor: "#000",
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    btnShadow: {
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    colors: {
      yellow: "#ffd33d",
      teal: "#2EC4B6",
      red: "#ef233c",
      green: "#10b981",
      orange: "#fb923c",
      blue: "#3b82f6",
      purple: "#a855f7",
    },
  };

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
    <SafeAreaView className={`flex-1 ${retro.bg} justify-between`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-32 right-8 w-14 h-14 bg-[#ef233c] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-64 left-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-48 right-12 w-12 h-12 bg-[#fb923c] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="px-6 mt-4 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() =>
            router.canGoBack() ? router.back() : router.replace("/(onboarding)")
          }
          className="p-2 bg-[#ffd33d] rounded-lg border-2 border-black"
          style={retro.btnShadow}
        >
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Progress Bar: Step 3 */}
        <View className="flex-row space-x-2">
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
        </View>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-black text-3xl font-rubik-bold uppercase tracking-tight">
          Recurring Bills
        </Text>
        <Text className="text-gray-600 text-base mt-2">
          Add your fixed expenses like Rent, Netflix, or Gym.
        </Text>
      </View>

      {/* LIST OF BILLS */}
      <ScrollView className="flex-1 px-6 mt-6">
        {bills.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons name="receipt-outline" size={64} color="#999" />
            <Text className="text-gray-500 mt-4 font-rubik-medium">
              No bills added yet.
            </Text>
          </View>
        ) : (
          bills.map((item) => (
            <View
              key={item.id}
              className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center border-2 border-black"
              style={retro.shadow}
            >
              <View>
                <Text className="text-black font-rubik-bold text-lg uppercase tracking-tight">
                  {item.description}
                </Text>
                {/* Full Date Format (e.g. 22/12/2025) */}
                <Text className="text-gray-600 text-xs mt-1 font-rubik-medium">
                  {item.frequency} • {item.date.toLocaleDateString("en-GB")}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="text-black font-rubik-bold text-lg mr-4">
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
          className="flex-row items-center justify-center bg-white border-2 border-black p-4 rounded-xl border-dashed mt-2 mb-10"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={24} color="black" />
          <Text className="text-black font-rubik-bold ml-2 uppercase tracking-tight">
            Add a Bill
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View className="px-6 mb-4">
        <TouchableOpacity
          onPress={() => router.push("/(onboarding)/saving-setup")}
          className="w-full py-5 rounded-xl items-center bg-[#2EC4B6] border-2 border-black"
          style={retro.btnShadow}
        >
          <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
            {bills.length === 0 ? "Skip for Now" : "Continue"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ADD BILL MODAL --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#FFFDF5] rounded-t-3xl p-6 border-t-2 border-black h-[80%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-black text-xl font-rubik-bold uppercase tracking-tight">
                  New Bill
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <TextInput
                placeholder="Description (e.g. Rent)"
                placeholderTextColor="#999"
                className="bg-white text-black p-4 rounded-xl mb-4 text-lg font-rubik-medium border-2 border-black"
                style={retro.shadow}
                value={desc}
                onChangeText={setDesc}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                autoFocus
              />

              <TextInput
                placeholder="Amount"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
                className="bg-white text-black p-4 rounded-xl mb-4 text-lg font-rubik-medium border-2 border-black"
                style={retro.shadow}
                value={amount}
                onChangeText={handleAmountChange}
                returnKeyType="done"
              />

              {/* Frequency Row */}
              <View className="flex-row justify-between mb-4">
                {FREQUENCIES.map((f) => (
                  <TouchableOpacity
                    key={f}
                    onPress={() => setFreq(f)}
                    className={`px-3 py-3 rounded-xl border-2 border-black ${freq === f ? "bg-[#A3E635]" : "bg-white"}`}
                    style={freq === f ? retro.btnShadow : undefined}
                  >
                    <Text
                      className={`font-rubik-bold ${freq === f ? "text-black" : "text-gray-600"}`}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Button */}
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="bg-white p-4 rounded-xl mb-6 flex-row justify-between border-2 border-black items-center"
                style={retro.shadow}
              >
                <View className="flex-row items-center">
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#FF6B6B"
                    style={{ marginRight: 8 }}
                  />
                  <Text className="text-gray-600 text-base font-rubik-bold uppercase tracking-tight">
                    Due Date
                  </Text>
                </View>
                <Text className="text-black font-rubik-bold text-lg">
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
                  <View
                    className="absolute top-20 left-4 right-4 bg-white p-4 rounded-2xl border-2 border-black z-50"
                    style={retro.shadow}
                  >
                    <Text className="text-black font-rubik-bold text-center mb-4 uppercase tracking-tight">
                      Select Due Date
                    </Text>
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="inline"
                      onChange={onDateChange}
                      themeVariant="light"
                      accentColor="#FF6B6B"
                    />
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      className="mt-4 bg-[#FF6B6B] py-3 rounded-xl items-center border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Text className="text-white font-rubik-bold uppercase tracking-tight">
                        Done
                      </Text>
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
                className={`w-full py-4 rounded-xl items-center mb-6 border-2 border-black ${desc && amount ? "bg-[#FF6B6B]" : "bg-gray-300"}`}
                style={desc && amount ? retro.btnShadow : undefined}
                disabled={!desc || !amount}
              >
                <Text
                  className={`font-rubik-bold text-lg uppercase tracking-tight ${desc && amount ? "text-white" : "text-gray-500"}`}
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
