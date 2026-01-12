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

const MenuRow = ({
  icon,
  label,
  onPress,
  color = "#2EC4B6",
  subtitle,
}: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`flex-row items-center ${retro.card} p-4 mb-3`}
    style={retro.btnShadow}
  >
    <View
      className={`w-10 h-10 rounded-lg bg-[${color}] border-2 border-black items-center justify-center mr-4`}
    >
      <Ionicons name={icon} size={20} color="white" />
    </View>
    <View className="flex-1">
      <Text className="text-black font-rubik-bold text-lg">{label}</Text>
      {subtitle && (
        <Text className="text-gray-500 text-xs font-rubik-bold uppercase mt-0.5">
          {subtitle}
        </Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color="black" />
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
        },
      },
    ]);
  };

  return (
    <SafeAreaView className={`flex-1 ${retro.bg} px-6`}>
      {/* Decorative background shapes */}
      <View
        className="absolute top-20 left-8 w-14 h-14 bg-[#10b981] rounded-full border-2 border-black opacity-15"
        style={retro.btnShadow}
      />
      <View
        className="absolute top-48 right-8 w-10 h-10 bg-[#ffd33d] rounded-xl border-2 border-black opacity-15 rotate-12"
        style={retro.btnShadow}
      />
      <View
        className="absolute bottom-32 left-12 w-12 h-12 bg-[#ef233c] rounded-lg border-2 border-black opacity-15"
        style={retro.btnShadow}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Simple Header */}
        <View className="items-center mt-6 mb-8">
          <View
            className="w-24 h-24 rounded-full border-4 border-black overflow-hidden bg-[#a855f7]"
            style={retro.shadow}
          >
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${userName}&background=a855f7&color=fff&bold=true`,
              }}
              className="w-full h-full"
            />
          </View>
          <Text className="text-black text-2xl font-rubik-bold mt-4 uppercase tracking-tight">
            {userName}
          </Text>
          <Text className="text-gray-500 text-sm font-rubik-bold">
            {user?.email}
          </Text>
        </View>

        {/* SETTINGS GROUP */}
        <Text className="text-gray-500 font-rubik-bold text-xs uppercase tracking-widest mb-3 ml-1">
          Settings
        </Text>

        <MenuRow
          icon="person"
          label="Edit Profile"
          onPress={() => router.push("/profile")}
          color="#2EC4B6"
        />

        <MenuRow
          icon="shield-checkmark"
          label="Privacy & Security"
          onPress={() => Alert.alert("Coming Soon")}
          color="#3B82F6"
        />

        {/* LOGOUT */}
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-[#ef233c] p-4 rounded-xl border-2 border-black mt-8 mb-10"
          style={retro.btnShadow}
        >
          <Ionicons
            name="log-out-outline"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text className="text-white font-rubik-bold uppercase tracking-tight">
            Log Out
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MoreMenu;
