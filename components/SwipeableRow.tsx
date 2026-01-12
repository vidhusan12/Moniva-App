import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { PropsWithChildren } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Distance (in pixels) the user must swipe to confirm the action
const SWIPE_THRESHOLD = 100; // Reduced from 150 for easier triggering

// Spring configuration for smoother animations
const SPRING_CONFIG = {
  damping: 25,
  stiffness: 300,
  mass: 0.5,
};

interface SwipeableRowProps extends PropsWithChildren {
  onSwipeLeft: () => void; // Delete action (swipe left to expose right side)
  onSwipeRight: () => void; // Edit action (swipe right to expose left side)
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const translateX = useSharedValue(0);
  const leftScale = useSharedValue(0);
  const rightScale = useSharedValue(0);

  // Gesture Handler Logic
  const panGesture = Gesture.Pan()
    .activeOffsetX([-5, 5])
    .failOffsetY([-15, 15])
    .onUpdate((event) => {
      const resistance = 0.6;
      const translation = event.translationX * resistance;

      // Clamp translation
      translateX.value = Math.max(
        -SCREEN_WIDTH * 0.35,
        Math.min(SCREEN_WIDTH * 0.35, translation)
      );

      // Scale animations for buttons (they grow as you swipe)
      if (event.translationX > 0) {
        leftScale.value = Math.min(1, Math.abs(event.translationX) / 80);
        rightScale.value = 0;
      } else {
        rightScale.value = Math.min(1, Math.abs(event.translationX) / 80);
        leftScale.value = 0;
      }
    })
    .onEnd((event) => {
      const isSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD || event.velocityX < -800;
      const isSwipeRight =
        event.translationX > SWIPE_THRESHOLD || event.velocityX > 800;

      if (isSwipeRight) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onSwipeRight)();
        translateX.value = withSpring(0, SPRING_CONFIG);
        leftScale.value = withTiming(0, { duration: 200 });
      } else if (isSwipeLeft) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        runOnJS(onSwipeLeft)();
        translateX.value = withSpring(0, SPRING_CONFIG);
        rightScale.value = withTiming(0, { duration: 200 });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
        leftScale.value = withTiming(0, { duration: 150 });
        rightScale.value = withTiming(0, { duration: 150 });
      }
    });

  // Animated Styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const leftButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftScale.value }],
    opacity: leftScale.value,
  }));

  const rightButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightScale.value }],
    opacity: rightScale.value,
  }));

  return (
    <View style={styles.container}>
      {/* Edit Button (Left) */}
      <Animated.View style={[styles.leftButton, leftButtonStyle]}>
        <View className="bg-blue-500 w-16 h-16 rounded-2xl items-center justify-center shadow-lg">
          <Ionicons name="create-outline" size={24} color="white" />
        </View>
      </Animated.View>

      {/* Delete Button (Right) */}
      <Animated.View style={[styles.rightButton, rightButtonStyle]}>
        <View className="bg-red-500 w-16 h-16 rounded-2xl items-center justify-center shadow-lg">
          <Ionicons name="trash-outline" size={24} color="white" />
        </View>
      </Animated.View>

      {/* Foreground content (animated) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle} className="w-full">
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

// Static Styles (required for absolute positioning)
const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  leftButton: {
    position: "absolute",
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
  },
  rightButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 0,
  },
});

SwipeableRow.displayName = "SwipeableRow";

export default SwipeableRow;
