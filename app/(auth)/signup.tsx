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
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-20 left-8 w-16 h-16 bg-[#10b981] rounded-full border-2 border-black opacity-20"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-48 right-12 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-40 right-8 w-12 h-12 bg-[#a855f7] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
      >
        {/* Header: Back Button */}
        <View className="mt-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-[#ffd33d] rounded-full items-center justify-center border-2 border-black"
            style={retro.btnShadow}
          >
            <Ionicons name="arrow-back" size={20} color="black" />
          </TouchableOpacity>
        </View>

        {/* Title Section */}
        <View className="mt-8 mb-8 relative">
          {/* Decorative colored circles */}
          <View
            className="absolute -top-4 -right-6 w-8 h-8 bg-[#10b981] rounded-full border-2 border-black opacity-40"
            style={retro.btnShadow}
          />
          <View
            className="absolute top-10 -left-6 w-6 h-6 bg-[#fb923c] rounded-full border-2 border-black opacity-40"
            style={retro.btnShadow}
          />

          <Text className="text-black text-3xl font-rubik-bold mb-2 uppercase tracking-tight">
            Create Account
          </Text>
          <Text className="text-gray-500 text-base font-rubik-bold">
            Start tracking your wealth 🚀
          </Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
          {/* Name Input */}
          <View
            className={`${retro.card} flex-row items-center p-4`}
            style={retro.btnShadow}
          >
            <Ionicons
              name="person-outline"
              size={20}
              color="#a855f7"
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              textContentType="name"
              className="flex-1 text-black font-rubik-bold text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>

          {/* Email Input */}
          <View
            className={`${retro.card} flex-row items-center p-4 mt-4`}
            style={retro.btnShadow}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color="#3b82f6"
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              className="flex-1 text-black font-rubik-bold text-base"
              style={{ paddingVertical: 0 }}
            />
          </View>

          {/* Password Input */}
          <View
            className={`${retro.card} flex-row items-center p-4 mt-4`}
            style={retro.btnShadow}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#ef233c"
              style={{ marginRight: 12 }}
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="flex-1 text-black font-rubik-bold text-base"
            />
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className={`bg-[#2EC4B6] p-4 rounded-xl mt-8 items-center border-2 border-black ${loading ? "opacity-70" : ""}`}
            style={retro.btnShadow}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
                Sign Up
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 👇 NEW: Social Login Section (Hardcoded View Box) */}
        <View className="mt-8">
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[2px] bg-black" />
            <Text className="text-gray-500 mx-4 font-rubik-bold text-xs uppercase tracking-wider">
              Or register with
            </Text>
            <View className="flex-1 h-[2px] bg-black" />
          </View>

          <View className="flex-row gap-4">
            {/* Google Button */}
            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon")}
              className="flex-1 bg-[#fff7ed] rounded-xl border-2 border-black p-4 flex-row items-center justify-center gap-3"
              style={retro.btnShadow}
            >
              <Ionicons name="logo-google" size={20} color="black" />
              <Text className="text-black font-rubik-bold">Google</Text>
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              onPress={() => Alert.alert("Coming Soon")}
              className="flex-1 bg-[#f0fdf4] rounded-xl border-2 border-black p-4 flex-row items-center justify-center gap-3"
              style={retro.btnShadow}
            >
              <Ionicons name="logo-apple" size={20} color="black" />
              <Text className="text-black font-rubik-bold">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end mb-6 mt-8">
          <TouchableOpacity
            onPress={() => router.push("/login")}
            className="self-center p-2"
          >
            <Text className="text-gray-500 font-rubik-bold">
              Already have an account?{" "}
              <Text className="text-[#a855f7] font-rubik-bold uppercase">
                Log In
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
