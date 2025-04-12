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

import * as SecureStore from 'expo-secure-store';
import React, { useState } from "react";
import {
  View,
  Text,
  Keyboard,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  Image,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

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

    //console.log("Starting login process...");

    try {
      let modUrl = url.trim();
      let modApiKey = apiKey.trim();

      //console.log("URL: ", modUrl);
      //console.log("API Key: ", modApiKey);

      if (!modUrl || !modApiKey) {
        setError("Please enter both URL and API Key");
        setLoading(false);  // Ensure the button is enabled
        return;
      }

      let fullUrl = `${modUrl}/tasks/index.json?apiKey=${modApiKey}`;
      //console.log("Full URL: ", fullUrl);

      // Set a timeout for the request
      timeout = setTimeout(() => {
        setTimeoutOccurred(true);
        //console.log("Timeout occurred");
        setLoading(false); // Ensure loading is stopped
      }, connTimeout);

      const controller = new AbortController();
      const timeoutAbort = setTimeout(() => controller.abort(), connTimeout);

      //console.log("Sending fetch request...");

      const fetchPromise = fetch(fullUrl, {
        signal: controller.signal,
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
      });

      const response = await fetchPromise;
      //console.log("Response received:", response);

      clearTimeout(timeoutAbort); // Clear timeout on success

      if (!response.ok) {
        // Log the response status code and body for debugging purposes
        const responseText = await response.text();
        /*
        console.error('Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseText
        });
        */

        // TODO; remove 500; it's a beetRoot-server issue, corrected in beetRoot 3.1.4
        // Handle authentication issues (401, 403, 500)
        const isAuthIssue = response.status === 401 || response.status === 403 || response.status === 500;
        setError(
          isAuthIssue
            ? `Invalid API Key or URL. Please check your credentials.`
            : `Unexpected error (Status: ${response.status}): ${response.statusText}. Please try again later.`
        );
        setLoading(false);
        return;
      }

      const data = await response.json();
      //console.log('Response Data:', data);

      try {
        // Reset the credentials before saving new ones
        await SecureStore.deleteItemAsync('url');
        await SecureStore.deleteItemAsync('apiKey');

        // Save to SecureStore
        await SecureStore.setItemAsync('url', modUrl);
        await SecureStore.setItemAsync('apiKey', modApiKey);

        //console.log("Credentials set successfully");

        // Only navigate if SecureStore set was successful
        navigation.replace("main");
      } catch (secureStoreError) {
        //console.error("SecureStore error:", secureStoreError);
        setError("Error saving credentials. Please check your input.");
        setLoading(false); // Ensure loading is stopped and button is enabled
      }

    } catch (error) {
      //console.error('Request error:', error.message);
      if (timeoutOccurred) {
        setError("Request timed out. Please try again.");
      } else {
        setError(`Network error: ${error.message}`);
      }
      setLoading(false); // Ensure loading is stopped after network request completes
    } finally {
      if (timeout) {
        clearTimeout(timeout); // Clear timeout
      }
      setTimeoutOccurred(false); // Reset timeoutOccurred
      //console.log("Finalizing request...");
    }
  };

  return (
  <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
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
  </TouchableWithoutFeedback>
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
