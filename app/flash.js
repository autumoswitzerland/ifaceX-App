/**
 * Copyright 2025 autumo GmbH, Michael Gasche.
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

import React, { useRef, useEffect } from "react";
import { View, Text, Modal, Animated, StyleSheet } from "react-native";

const FlashMessage = ({ message, visible, onClose }) => {
  //const [opacity] = useState(new Animated.Value(1));
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, {
        toValue: 0,
        //delay: 1000, // Delay of 1 second before starting fade-out
        duration: 3000, // 1 second
        useNativeDriver: true,
      }).start(() => {
        // Call onClose callback after animation completes
        onClose();
      });
    } else {
      // Reset opacity value when the component is hidden
      opacity.setValue(1);
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent>
      <Animated.View style={[styles.modalContainer, { opacity }]}>
        <View style={styles.modalContent}>
          <Text style={styles.flashMsg}>{message}</Text>
        </View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    zIndex: 999,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  modalContent: {
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    padding: 20,
    borderRadius: 10,
  },
  flashMsg: {
    color: "white",
    fontSize: 16,
  },
});

export default FlashMessage;
