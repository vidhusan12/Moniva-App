import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Keyboard,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "../../app/context/UserContext";

export default function SavingSetup() {
  const { savings, addSaving, removeSaving } = useUser();

  // Modal & Form State
  const [isModalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");

  // The Smart Formatter Logic
  const handleTargetChange = (text: string) => {
    // 1. Remove junk (letters, symbols like / * -)
    let cleaned = text.replace(/[^0-9.]/g, "");

    // 2. Prevent double dots (e.g. 10.5.5)
    const dots = cleaned.split(".").length - 1;
    if (dots > 1) return;

    // 3. Format with commas
    if (cleaned.endsWith(".")) {
      setTarget(cleaned); // Allow "100." while typing
    } else if (cleaned.includes(".")) {
      const [integer, decimal] = cleaned.split(".");
      setTarget(`${Number(integer).toLocaleString()}.${decimal}`);
    } else {
      setTarget(cleaned === "" ? "" : Number(cleaned).toLocaleString());
    }
  };

  const handleAddSaving = () => {
    if (!name || !target) return;

    // Clean formatting before saving (remove commas for the raw number if needed later,
    // but typically we store string for display or clean number for math)
    // For now, we store the formatted string or clean it here if you prefer.
    // Let's store the clean number string for consistency with other inputs.
    const cleanAmount = target.replace(/,/g, "");

    addSaving({
      id: Date.now().toString(),
      name: name,
      targetAmount: cleanAmount, // Store as "50000.84"
    });

    // Reset & Close
    setName("");
    setTarget("");
    setModalVisible(false);
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

        {/* Progress Bar: Step 4 */}
        <View className="flex-row space-x-2">
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
          <View className="w-8 h-1 bg-teal-500 rounded-full" />
        </View>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-white text-3xl font-rubik-bold">
          Savings Goals
        </Text>
        <Text className="text-gray-400 text-base mt-2">
          What are you saving for? (e.g. New Car, Holiday)
        </Text>
      </View>

      {/* LIST OF SAVINGS */}
      <ScrollView className="flex-1 px-6 mt-6">
        {savings.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons name="wallet-outline" size={64} color="gray" />
            <Text className="text-gray-500 mt-4">No goals added yet.</Text>
          </View>
        ) : (
          savings.map((item) => (
            <View
              key={item.id}
              className="bg-[#1a1a1a] p-4 rounded-xl mb-3 flex-row justify-between items-center border border-white/5"
            >
              <View>
                <Text className="text-white font-rubik-medium text-lg">
                  {item.name}
                </Text>
                <Text className="text-teal-500 text-xs font-rubik mt-1">
                  {/* Format it nicely for display */}
                  Target: ${Number(item.targetAmount).toLocaleString()}
                </Text>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity onPress={() => removeSaving(item.id)}>
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
          <Text className="text-white font-rubik-medium ml-2">Add a Goal</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View className="px-6 mb-4">
        <TouchableOpacity
          onPress={() => router.push("/(onboarding)/finishing-up")}
          className="w-full py-5 rounded-full items-center bg-teal-500"
        >
          <Text className="text-white font-rubik-bold text-lg">
            {savings.length === 0 ? "Skip for Now" : "Finish Setup"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ADD SAVING MODAL --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#1a1a1a] rounded-t-3xl p-6 border-t border-white/10 h-[60%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-xl font-rubik-bold">
                  New Goal
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="gray" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <TextInput
                placeholder="Goal Name (e.g. Emergency Fund)"
                placeholderTextColor="#666"
                className="bg-black/50 text-white p-4 rounded-xl mb-4 text-lg font-rubik border border-white/5"
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <TextInput
                placeholder="Target Amount ($)"
                placeholderTextColor="#666"
                keyboardType="numeric"
                className="bg-black/50 text-white p-4 rounded-xl mb-4 text-lg font-rubik border border-white/5"
                value={target}
                // Uses the smart handler
                onChangeText={handleTargetChange}
              />

              <View className="flex-1" />

              <TouchableOpacity
                onPress={handleAddSaving}
                className={`w-full py-4 rounded-full items-center mb-6 ${name && target ? "bg-teal-500" : "bg-gray-800"}`}
                disabled={!name || !target}
              >
                <Text
                  className={`font-rubik-bold text-lg ${name && target ? "text-white" : "text-gray-500"}`}
                >
                  Save Goal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}
