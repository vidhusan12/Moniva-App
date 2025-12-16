import * as Haptics from "expo-haptics";
import React, { PropsWithChildren } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Distance (in pixels) the user must swipe to confirm the action
const SWIPE_THRESHOLD = 150;

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
  const leftOpacity = useSharedValue(0);
  const rightOpacity = useSharedValue(0);

  // Gesture Handler Logic
  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10]) // Only activate after 10px horizontal movement
    .failOffsetY([-10, 10]) // Cancel if vertical movement exceeds 10px (allows scrolling)
    .onStart(() => {
      // Gesture started
    })
    .onUpdate((event) => {
      // Only update if horizontal movement is dominant
      const isHorizontalSwipe =
        Math.abs(event.translationX) > Math.abs(event.translationY);

      if (isHorizontalSwipe) {
        // Clamp between -50% and 50% of screen width to prevent over-swiping
        translateX.value = Math.max(
          -SCREEN_WIDTH * 0.5,
          Math.min(SCREEN_WIDTH * 0.5, event.translationX)
        );

        // Update opacity based on swipe distance for visual feedback
        if (event.translationX > 0) {
          leftOpacity.value = Math.min(1, event.translationX / SWIPE_THRESHOLD);
          rightOpacity.value = 0;
        } else {
          rightOpacity.value = Math.min(
            1,
            Math.abs(event.translationX) / SWIPE_THRESHOLD
          );
          leftOpacity.value = 0;
        }
      }
    })
    .onEnd((event) => {
      // Check both distance AND velocity for better detection
      const isSwipeLeft =
        event.translationX < -SWIPE_THRESHOLD || event.velocityX < -500;
      const isSwipeRight =
        event.translationX > SWIPE_THRESHOLD || event.velocityX > 500;

      if (isSwipeRight) {
        // Trigger haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        // Trigger Edit action, then spring back
        runOnJS(onSwipeRight)();
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        leftOpacity.value = withSpring(0);
      } else if (isSwipeLeft) {
        // Trigger haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        // Trigger Delete action, then spring back
        runOnJS(onSwipeLeft)();
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        rightOpacity.value = withSpring(0);
      } else {
        // Snap back smoothly if swipe wasn't strong enough
        translateX.value = withSpring(0, {
          damping: 20,
          stiffness: 200,
        });
        leftOpacity.value = withSpring(0);
        rightOpacity.value = withSpring(0);
      }
    });

  // Animated Styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const leftActionStyle = useAnimatedStyle(() => ({
    opacity: leftOpacity.value,
  }));

  const rightActionStyle = useAnimatedStyle(() => ({
    opacity: rightOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* Background Actions - left to edit - blue */}
      <Animated.View
        style={[
          styles.absoluteFill,
          styles.leftActionContainer,
          leftActionStyle,
        ]}
      >
        <TouchableOpacity
          className="flex-1 bg-blue-600 justify-center items-start pl-6"
          onPress={() => onSwipeRight()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-rubik-bold">Edit</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Background Actions - right to delete - red */}
      <Animated.View
        style={[
          styles.absoluteFill,
          styles.rightActionContainer,
          rightActionStyle,
        ]}
      >
        <TouchableOpacity
          className="flex-1 bg-red-600 justify-center items-end pr-6"
          onPress={() => onSwipeLeft()}
          activeOpacity={0.8}
        >
          <Text className="text-white font-rubik-bold">Delete</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Foreground content (animated) */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle} className="w-full bg-white z-10">
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
    // The container holds the background and foreground
  },
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    // Ensures background views cover the item space
  },
  leftActionContainer: {
    // Defines where the left action background lives
  },
  rightActionContainer: {
    // Defines where the right action background lives
  },
});

SwipeableRow.displayName = "SwipeableRow";

export default SwipeableRow;
