import { auth } from "@/config/firebase";
import * as AppleAuthentication from "expo-apple-authentication";
import { OAuthProvider, signInWithCredential } from "firebase/auth";
import React from "react";
import { Platform, View } from "react-native";

export const AppleAuthButton = () => {
  // Apply login only works on ios
  if (Platform.OS !== "ios") return null;

  return (
    <View className="w-full h-12 mt-3">
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
        cornerRadius={12}
        style={{ width: "100%", height: "100%" }}
        onPress={async () => {
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
            }
          } catch (e: any) {
            if (e.code !== "ERR_CANCELEd") console.error(e);
          }
        }}
      />
    </View>
  );
};
