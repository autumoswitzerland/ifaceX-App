/**
 * Copyright 2024 autumo GmbH, Michael Gasche.
 * All Rights Reserved.
 *
 * NOTICE: All information contained herein is, and remains
 * the property of autumo GmbH The intellectual and technical
 * concepts contained herein are proprietary to autumo GmbH
 * and are protected by trade secret or copyright law.
 *
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from autumo GmbH.
 *
 */

//
// UNUSED
//

import React, { useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const { height } = Dimensions.get("window");

const CustomScrollBar = ({ children }) => {
  const scrollIndicator = useRef(new Animated.Value(0)).current;
  const scrollViewHeight = height * 0.8;
  const contentHeight = React.Children.count(children) * 100; // Adjust 100 based on item height

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollIndicator } } }],
    { useNativeDriver: false }
  );

  const indicatorSize = scrollViewHeight * (scrollViewHeight / contentHeight);
  const difference =
    scrollViewHeight > indicatorSize ? scrollViewHeight - indicatorSize : 1;
  const scrollIndicatorPosition = Animated.multiply(
    scrollIndicator,
    scrollViewHeight / contentHeight
  ).interpolate({
    inputRange: [0, difference],
    outputRange: [0, difference],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <Animated.View
        style={[
          styles.indicator,
          {
            height: indicatorSize,
            transform: [{ translateY: scrollIndicatorPosition }],
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  scrollView: {
    flex: 1,
  },
  indicator: {
    width: 4,
    backgroundColor: "#666666",
    borderRadius: 2,
    position: "absolute",
    right: 2,
  },
});

export default CustomScrollBar;
