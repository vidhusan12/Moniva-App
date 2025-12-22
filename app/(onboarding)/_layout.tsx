import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      {/* The Welcome Screen */}
      <Stack.Screen name="index" />

      {/* Step 1: Money in the Bank */}
      <Stack.Screen name="wallet-setup" />

      {/* Step 2: Income Cycle */}
      <Stack.Screen name="income-setup" />

      {/* Step 3: Bills  */}
      <Stack.Screen name="bill-setup" />

      {/* Step 4: Savings & Final */}
      <Stack.Screen name="saving-setup" />
    </Stack>
  );
}
