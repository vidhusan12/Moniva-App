import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth, db } from "../../config/firebase";

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

      // Create user document directly at users/{uid}
      await setDoc(doc(db, "users", user.uid), {
        displayName: name,
        email: user.email,
        isOnboardingComplete: false,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success!", "Account created successfully");
      router.replace("/(onboarding)/wallet-setup");
    } catch (error: any) {
      Alert.alert("Sign Up Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]">
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}>
        
        {/* Header: Back Button */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-white/5 rounded-full items-center justify-center border border-white/10"
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View className="mt-8 mb-8">
          <Text className="text-white text-3xl font-rubik-bold mb-2">
            Create Account
          </Text>
          <Text className="text-gray-400 text-base font-rubik">
            Start tracking your wealth 🚀
          </Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
          
          {/* Name Input */}
          <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/10">
            <Ionicons name="person-outline" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              className="flex-1 text-white font-rubik text-base"
            />
          </View>

          {/* Email Input */}
          <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/10 mt-4">
            <Ionicons name="mail-outline" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#666"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              className="flex-1 text-white font-rubik text-base"
            />
          </View>

          {/* Password Input */}
          <View className="bg-[#1a1a1a] flex-row items-center p-4 rounded-2xl border border-white/10 mt-4">
            <Ionicons name="lock-closed-outline" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="flex-1 text-white font-rubik text-base"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`bg-blue-600 p-4 rounded-2xl mt-8 items-center shadow-lg shadow-blue-500/30 ${loading ? "opacity-70" : ""}`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-lg">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 👇 NEW: Social Login Section (Hardcoded View Box) */}
        <View className="mt-8">
            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-[1px] bg-white/10" />
                <Text className="text-gray-500 mx-4 font-rubik text-xs uppercase tracking-wider">Or register with</Text>
                <View className="flex-1 h-[1px] bg-white/10" />
            </View>

            <View className="flex-row gap-4">
                {/* Google Button */}
                <TouchableOpacity 
                  onPress={() => Alert.alert("Coming Soon")}
                  className="flex-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 flex-row items-center justify-center gap-3"
                >
                    <Ionicons name="logo-google" size={20} color="white" />
                    <Text className="text-white font-rubik-medium">Google</Text>
                </TouchableOpacity>

                {/* Apple Button */}
                <TouchableOpacity 
                  onPress={() => Alert.alert("Coming Soon")}
                  className="flex-1 bg-[#1a1a1a] p-4 rounded-2xl border border-white/10 flex-row items-center justify-center gap-3"
                >
                    <Ionicons name="logo-apple" size={20} color="white" />
                    <Text className="text-white font-rubik-medium">Apple</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end mb-6 mt-8">
            <TouchableOpacity onPress={() => router.push("/login")} className="self-center p-2">
            <Text className="text-gray-400 font-rubik">
                Already have an account?{" "}
                <Text className="text-blue-500 font-rubik-bold">Log In</Text>
            </Text>
            </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;