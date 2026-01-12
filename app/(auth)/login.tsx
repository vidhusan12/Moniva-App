import { useGoogleAuth } from "@/hooks/useGoogleAuth";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";
import {
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);

  const { promptAsync } = useGoogleAuth();

  const handleLogin = async () => {
    if (email === "" || password === "") {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
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

  const handleAppleLogin = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = credential;
      if (identityToken) {
        const provider = new OAuthProvider("apple.com");
        const firebaseCredential = provider.credential({
          idToken: identityToken,
        });
        await signInWithCredential(auth, firebaseCredential);
        // Navigation handles itself via your existing auth listener or you can push here
        router.replace("/(tabs)");
      }
    } catch (e: any) {
      if (e.code !== "ERR_CANCELED") {
        Alert.alert("Error", "Apple Sign In failed");
        console.error(e);
      }
    }
  };

  const handleResetPassword = async () => {
    if (resetEmail === "") {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert("Success", "Password reset email sent! Check your inbox.");
      setModalVisible(false);
      setResetEmail("");
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.code === "auth/user-not-found"
          ? "No account found with this email"
          : "Failed to send reset email. Please try again."
      );
      console.log(error);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <SafeAreaView className={`flex-1 ${retro.bg}`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-20 right-8 w-16 h-16 bg-[#ef233c] rounded-full border-2 border-black opacity-20"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-40 right-16 w-10 h-10 bg-[#a855f7] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 left-8 w-12 h-12 bg-[#3b82f6] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
      >
        {/* Header Back Button */}
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
            className="absolute -top-4 -right-6 w-8 h-8 bg-[#ffd33d] rounded-full border-2 border-black opacity-40"
            style={retro.btnShadow}
          />
          <View
            className="absolute top-10 -left-6 w-6 h-6 bg-[#10b981] rounded-full border-2 border-black opacity-40"
            style={retro.btnShadow}
          />

          <Text className="text-black text-3xl font-rubik-bold mb-2 uppercase tracking-tight">
            Welcome Back
          </Text>
          <Text className="text-gray-500 text-base font-rubik-bold">
            Log in to continue managing your wealth.
          </Text>
        </View>

        {/* Form Section */}
        <View className="space-y-4">
          {/* Email Input */}
          <View
            className={`${retro.card} flex-row items-center p-4`}
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

          <TouchableOpacity
            className="self-end mt-2"
            onPress={() => setModalVisible(true)}
          >
            <Text className="text-[#fb923c] font-rubik-bold text-sm uppercase">
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className={`bg-[#2EC4B6] p-4 rounded-xl mt-6 items-center border-2 border-black ${loading ? "opacity-70" : ""}`}
            style={retro.btnShadow}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
                Log In
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Social Login Section */}
        <View className="mt-8">
          <View className="flex-row items-center mb-6">
            <View className="flex-1 h-[2px] bg-black" />
            <Text className="text-gray-500 mx-4 font-rubik-bold text-xs uppercase tracking-wider">
              Or continue with
            </Text>
            <View className="flex-1 h-[2px] bg-black" />
          </View>

          <View className="flex-row gap-4">
            {/* Google Button */}
            <TouchableOpacity
              className="flex-1 bg-[#fff7ed] rounded-xl border-2 border-black p-4 flex-row items-center justify-center gap-3"
              style={retro.btnShadow}
              disabled={googleLoading || loading}
              onPress={async () => {
                try {
                  setGoogleLoading(true);
                  await promptAsync();
                } catch (error) {
                  console.error("Google auth error:", error);
                  Alert.alert(
                    "Error",
                    "Google sign in failed. Please try again."
                  );
                } finally {
                  setTimeout(() => setGoogleLoading(false), 1000);
                }
              }}
            >
              {googleLoading ? (
                <ActivityIndicator color="black" size="small" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={20} color="black" />
                  <Text className="text-black font-rubik-bold">Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Apple Button */}
            <TouchableOpacity
              className="flex-1 bg-[#f0fdf4] rounded-xl border-2 border-black p-4 flex-row items-center justify-center gap-3"
              style={retro.btnShadow}
              onPress={handleAppleLogin}
            >
              <Ionicons name="logo-apple" size={20} color="black" />
              <Text className="text-black font-rubik-bold">Apple</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="flex-1 justify-end mb-6 mt-8">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
            className="self-center p-2"
          >
            <Text className="text-gray-500 font-rubik-bold">
              Don't have an account?{" "}
              <Text className="text-[#a855f7] font-rubik-bold uppercase">
                Sign Up
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View className="flex-1 bg-black/80 justify-end">
              <TouchableWithoutFeedback>
                {/* White card content */}
                <View className="bg-[#FFFDF5] rounded-t-3xl p-6 border-t-4 border-[#ffd33d] max-h-[50%]">
                  {/* Header */}
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-black text-xl font-rubik-bold uppercase tracking-tight">
                      Reset Password
                    </Text>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      className="w-8 h-8 bg-[#ef233c] rounded-full items-center justify-center border-2 border-black"
                      style={retro.btnShadow}
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                  {/* Description */}
                  <Text className="text-gray-500 font-rubik-medium mb-4">
                    Enter your email to receive a password reset link
                  </Text>

                  {/* Email Input */}
                  <View
                    className={`${retro.card} flex-row items-center p-4 mb-4`}
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
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      className="flex-1 text-black font-rubik-bold text-base"
                      style={{ paddingVertical: 0 }}
                    />
                  </View>
                  {/* Send Button */}
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={resetLoading}
                    className={`w-full py-4 rounded-xl items-center bg-[#2EC4B6] border-2 border-black mt-2 ${
                      resetLoading ? "opacity-70" : ""
                    }`}
                    style={retro.btnShadow}
                  >
                    {resetLoading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text className="text-white font-rubik-bold text-lg uppercase tracking-tight">
                        Send Link
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default Login;
