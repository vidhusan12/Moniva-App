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
    <SafeAreaView className={`flex-1 ${retro.bg} justify-between`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-32 right-8 w-14 h-14 bg-[#a855f7] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-64 left-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-48 right-12 w-12 h-12 bg-[#10b981] rounded-lg border-2 border-black opacity-15"
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

        {/* Progress Bar: Step 4 */}
        <View className="flex-row space-x-2">
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
          <View className="w-8 h-1 bg-[#2EC4B6] rounded-lg border border-black" />
        </View>
      </View>

      <View className="px-6 mt-6">
        <Text className="text-black text-3xl font-rubik-bold uppercase tracking-tight">
          Savings Goals
        </Text>
        <Text className="text-gray-600 text-base mt-2">
          What are you saving for? (e.g. New Car, Holiday)
        </Text>
      </View>

      {/* LIST OF SAVINGS */}
      <ScrollView className="flex-1 px-6 mt-6">
        {savings.length === 0 ? (
          <View className="items-center justify-center py-10 opacity-50">
            <Ionicons name="wallet-outline" size={64} color="#999" />
            <Text className="text-gray-500 mt-4 font-rubik-medium">
              No goals added yet.
            </Text>
          </View>
        ) : (
          savings.map((item) => (
            <View
              key={item.id}
              className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center border-2 border-black"
              style={retro.shadow}
            >
              <View>
                <Text className="text-black font-rubik-bold text-lg uppercase tracking-tight">
                  {item.name}
                </Text>
                <Text className="text-[#A855F7] text-xs font-rubik-bold mt-1 uppercase tracking-widest">
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
          className="flex-row items-center justify-center bg-white border-2 border-black p-4 rounded-xl border-dashed mt-2 mb-10"
          style={retro.btnShadow}
        >
          <Ionicons name="add" size={24} color="black" />
          <Text className="text-black font-rubik-bold ml-2 uppercase tracking-tight">
            Add a Goal
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* FOOTER */}
      <View className="px-6 mb-4">
        <TouchableOpacity
          onPress={() => router.push("/(onboarding)/finishing-up")}
          className="w-full py-5 rounded-xl items-center bg-[#2EC4B6] border-2 border-black"
          style={retro.btnShadow}
        >
          <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
            {savings.length === 0 ? "Skip for Now" : "Finish Setup"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- ADD SAVING MODAL --- */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/80 justify-end">
            <View className="bg-[#FFFDF5] rounded-t-3xl p-6 border-t-2 border-black h-[60%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-black text-xl font-rubik-bold uppercase tracking-tight">
                  New Goal
                </Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {/* Form Fields */}
              <TextInput
                placeholder="Goal Name (e.g. Emergency Fund)"
                placeholderTextColor="#999"
                className="bg-white text-black p-4 rounded-xl mb-4 text-lg font-rubik-medium border-2 border-black"
                style={retro.shadow}
                value={name}
                onChangeText={setName}
                autoFocus
              />

              <TextInput
                placeholder="Target Amount ($)"
                placeholderTextColor="#999"
                keyboardType="numeric"
                className="bg-white text-black p-4 rounded-xl mb-4 text-lg font-rubik-medium border-2 border-black"
                style={retro.shadow}
                value={target}
                // Uses the smart handler
                onChangeText={handleTargetChange}
              />

              <View className="flex-1" />

              <TouchableOpacity
                onPress={handleAddSaving}
                className={`w-full py-4 rounded-xl items-center mb-6 border-2 border-black ${name && target ? "bg-[#A855F7]" : "bg-gray-300"}`}
                style={name && target ? retro.btnShadow : undefined}
                disabled={!name || !target}
              >
                <Text
                  className={`font-rubik-bold text-lg uppercase tracking-tight ${name && target ? "text-white" : "text-gray-500"}`}
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
