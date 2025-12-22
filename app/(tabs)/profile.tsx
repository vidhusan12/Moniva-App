import { auth, db } from "@/config/firebase";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MenuRow = ({ icon, label, onPress, color = "white", subtitle }: any) => (
  <TouchableOpacity 
    onPress={onPress} 
    className="flex-row items-center bg-[#1a1a1a] p-4 rounded-2xl mb-3 border border-white/5"
  >
    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center mr-4">
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View className="flex-1">
        <Text className="text-white font-rubik-medium text-lg">{label}</Text>
        {subtitle && <Text className="text-gray-500 text-xs font-rubik mt-0.5">{subtitle}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const MoreMenu = () => {
  const user = auth.currentUser;
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    const fetchName = async () => {
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserName(docSnap.data().displayName || "User");
        }
      }
    };
    fetchName();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: async () => {
          await signOut(auth);
          router.replace("/(onboarding)");
        } 
      }
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a] px-6">
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Simple Header */}
        <View className="items-center mt-6 mb-8">
            <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${userName}&background=0D8ABC&color=fff` }}
                className="w-20 h-20 rounded-full border-4 border-[#1a1a1a]"
            />
            <Text className="text-white text-xl font-rubik-bold mt-3">{userName}</Text>
            <Text className="text-gray-500 text-sm font-rubik">{user?.email}</Text>
        </View>

        {/* SETTINGS GROUP */}
        <Text className="text-gray-500 font-rubik-medium text-xs uppercase tracking-widest mb-3 ml-1">
          Settings
        </Text>

        <MenuRow 
            icon="person" 
            label="Edit Profile" 
            onPress={() => router.push("/profile")} 
            color="#2dd4bf"
        />

        <MenuRow 
            icon="shield-checkmark" 
            label="Privacy & Security" 
            onPress={() => Alert.alert("Coming Soon")} 
            color="#3b82f6"
        />

        {/* LOGOUT */}
        <TouchableOpacity 
            onPress={handleLogout}
            className="flex-row items-center justify-center bg-red-500/10 p-4 rounded-2xl mt-8 mb-10 border border-red-500/20"
        >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{ marginRight: 8 }} />
            <Text className="text-red-500 font-rubik-medium">Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreMenu;