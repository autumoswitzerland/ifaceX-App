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

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Keychain from 'react-native-keychain';
//import AsyncStorage from "@react-native-async-storage/async-storage";

const LoginScreen = () => {
  const navigation = useNavigation();

  const [url, setUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUrlInputFocused, setIsUrlInputFocused] = useState(false);
  const [isApiKeyInputFocused, setIsApiKeyInputFocused] = useState(false);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  const handleLogin = async () => {

    const connTimeout = 3000;

    setLoading(true);
    setError("");
    setTimeoutOccurred(false); // Reset timeoutOccurred

    let timeout;

    try {

      let modUrl = url.trim();
      if (!modUrl.startsWith('http://') && !modUrl.startsWith('https://')) {
        modUrl = 'http://' + modUrl;
      }
      if (!modUrl.endsWith('/')) {
        modUrl = modUrl + '/';
      }      
      let modApiKey = apiKey.trim();

      if (!modUrl || !modApiKey) {
        setError("Please enter both URL and API Key");
        return;
      }
  
      const fullUrl = `${modUrl}tasks/index.json?apiKey=${modApiKey}`;
      //console.log("Request URL:", fullUrl); // Debugging

      timeout = setTimeout(() => {
        clearTimeout(timeout);
        setTimeoutOccurred(true);
      }, connTimeout); // Set timeout

      // Fetch with custom timeout using Promise.race
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Request timed out!")), connTimeout);
      });

      const fetchPromise = fetch(fullUrl, {
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      //console.log('Response Data:', data); // Debugging

      await Keychain.setGenericPassword(modUrl, modApiKey, {
        accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_ANY_OR_DEVICE_PASSCODE,
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
      });
      //await AsyncStorage.setItem("url", url);
      //await AsyncStorage.setItem("apiKey", apiKey);

      navigation.replace("main");
    } catch (error) {
      //console.error('Network error:', error.message);
      //Alert.alert('Error', `Network request failed: ${error.message}`);
      setError(`Network request failed: ${error.message}`);
    } finally {
      try {
        setLoading(false); // Set loading to false after network request completes (whether successful or not)
        if (timeout) {
          clearTimeout(timeout); // Clear the timeout if the request completes before the timeout duration
        }
        setTimeoutOccurred(false); // Reset timeoutOccurred when request completes
      } catch (error) {
        console.error("Error in finally block:", error.message);
      }
    }
  };

  return (
    <View style={styles.container} screenOptions={{ headerShown: false }}>
      <StatusBar barStyle="light-content" />
      <Image
        source={require("../assets/images/ifaceX.png")}
        style={styles.image}
      />
      <TextInput
        style={[styles.input, isUrlInputFocused && styles.inputFocused]}
        placeholder="Website URL + Port"
        placeholderTextColor="#aaa"
        value={url}
        onChangeText={setUrl}
        onFocus={() => setIsUrlInputFocused(true)}
        onBlur={() => setIsUrlInputFocused(false)}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, isApiKeyInputFocused && styles.inputFocused]}
        placeholder="API Key"
        placeholderTextColor="#aaa"
        value={apiKey}
        onChangeText={setApiKey}
        onFocus={() => setIsApiKeyInputFocused(true)}
        onBlur={() => setIsApiKeyInputFocused(false)}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={[
          styles.button,
          (loading || timeoutOccurred) && styles.disabledButton,
        ]}
        onPress={handleLogin}
        disabled={loading || timeoutOccurred}
      >
        {!loading && <Text style={styles.buttonText}>Login</Text>}
        {loading && <Text style={styles.loadingText}>Loading...</Text>}
      </TouchableOpacity>
      <Modal visible={!!error} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError("")}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Ok</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#111111",
  },
  image: {
    width: 200, // Set the width of the image
    height: 200, // Set the height of the image
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    padding: 10,
    marginVertical: 10,
    color: "#ddd",
    backgroundColor: "#666666",
    borderRadius: 10, // Rounded edges for text input
  },
  inputFocused: {
    borderWidth: 1,
    borderColor: "#2DC7FE", // Border color when input is focused
  },
  button: {
    marginTop: 20,
    width: "80%",
    backgroundColor: "#07b",
    padding: 10,
    borderRadius: 10, // Rounded edges for button
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  loadingText: {
    color: "#b70",
    fontSize: 18,
  },
  disabledButton: {
    opacity: 0.6, // Reduce opacity to visually indicate that the button is disabled
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  modalContent: {
    backgroundColor: "#222222",
    padding: 20,
    borderRadius: 10,
    textAlign: "left",
  },
  errorTitle: {
    fontSize: 18,
    color: "red",
    marginBottom: 10,
    textAlign: "left",
    fontWeight: "bold",
  },
  errorText: {
    color: "white",
    marginBottom: 10,
    textAlign: "left",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#07b",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
  },
});

export default LoginScreen;
