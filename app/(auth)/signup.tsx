import { FinanceService } from "@/services/financeService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../../config/firebase"; // Adjust path based on your folder structure

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // SignUp logic
  const handleSignUp = async () => {
    if (email === "" || password === "" || name === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Save the real name to Firestore immediately
      await FinanceService.updateItem("users", user.uid, "profile", {
        displayName: name,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success!", "Account created successfully");
      router.replace("/(tabs)/profile");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a] px-6 justify-center">
      <View className="mb-10">
        <Text className="text-white text-4xl font-rubik-bold">
          Create Account
        </Text>
        <Text className="text-gray-400 text-lg mt-2">
          Start tracking your wealth 🚀
        </Text>
      </View>

      <View className="space-y-4">
        {/* Name Input */}
        <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/5 mb-4">
          <Ionicons
            name="person-outline"
            size={20}
            color="#3b82f6"
            className="mr-3"
          />
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#4b5563"
            value={name}
            onChangeText={setName}
            className="flex-1 text-white font-rubik"
          />
        </View>
        {/* Email Input */}
        <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/5">
          <Ionicons
            name="mail-outline"
            size={20}
            color="#3b82f6"
            className="mr-3"
          />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#4b5563"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            className="flex-1 text-white font-rubik"
          />
        </View>

        {/* Password Input */}
        <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/5 mt-4">
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#3b82f6"
            className="mr-3"
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#4b5563"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            className="flex-1 text-white font-rubik"
          />
        </View>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={handleSignUp}
          disabled={loading}
          className={`bg-blue-600 p-4 rounded-2xl mt-8 items-center ${loading ? "opacity-70" : ""}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-rubik-bold text-lg">Sign Up</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.push("/login")}
        className="mt-6 self-center"
      >
        <Text className="text-gray-400 font-rubik">
          Already have an account?{" "}
          <Text className="text-blue-500 font-rubik-bold">Log In</Text>
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SignUp;
