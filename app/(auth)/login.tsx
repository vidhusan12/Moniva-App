import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
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
import { auth, db } from "../../config/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists() && userDoc.data()?.isOnboardingComplete) {
         router.replace("/(tabs)");
      } else {
         router.replace("/(onboarding)/wallet-setup");
      }

    } catch (error) {
      Alert.alert("Login Error", "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    // 👇 CHANGED: Removed 'justify-center' so we can place the header at the top
    <SafeAreaView className="flex-1 bg-[#0a0a0a] px-6">
      
      {/* 👇 NEW: Back Button Header */}
      <View className="mt-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="p-2 bg-white/10 rounded-full self-start"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* 👇 NEW: Wrapper to re-center the form content */}
      <View className="flex-1 justify-center">
        <View className="mb-10">
          <Text className="text-white text-4xl font-rubik-bold">
            Welcome Back
          </Text>
          <Text className="text-gray-400 text-lg mt-2">
            Log in to manage your finances 💸
          </Text>
        </View>

        <View className="space-y-4">
          <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/5">
            <Ionicons name="mail-outline" size={20} color="#3b82f6" className="mr-3" />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#4b5563"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              className="flex-1 text-white font-rubik"
            />
          </View>

          <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/5 mt-4">
            <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" className="mr-3" />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#4b5563"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="flex-1 text-white font-rubik"
            />
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-blue-600 p-4 rounded-2xl mt-8 items-center ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-lg">Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")} className="mt-6 self-center">
          <Text className="text-gray-400 font-rubik">
            Don't have an account?{" "}
            <Text className="text-blue-500 font-rubik-bold">Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

export default Login;