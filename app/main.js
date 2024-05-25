

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

import React, { useEffect, useState, useRef } from "react";
import {
  Vibration,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Audio } from "expo-av";
import Orientation from "react-native-orientation-locker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FlashMessage from "./flash";

const MainScreen = () => {
  const navigation = useNavigation();

  const sound = useRef(new Audio.Sound());
  const [orientation, setOrientation] = useState();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);
  const [showFlashMessage, setShowFlashMessage] = useState(false);

  const fetchInterval = 60000;
  const intervalIdRef = useRef(null);

  useEffect(() => {
    loadSound(); // Load the audio file when the component mounts

    // Fetch data on component mount
    fetchData(true, false);

    intervalIdRef.current = setInterval(() => {
      fetchData(false, false); // Call fetchData function to fetch data immediately
    }, fetchInterval);

    // TODO
    Orientation.lockToPortrait();
    //Orientation.unlockAllOrientations();
    // Get the initial orientation
    const initialOrientation = Orientation.getInitialOrientation();
    //console.log('Initial orientation:', initialOrientation);
    setOrientation(initialOrientation);
    const handleOrientationChange = (newOrientation) => {
      //console.log('Orientation changed to:', newOrientation);
      setOrientation(newOrientation);
    };
    // Subscribe to orientation change events
    Orientation.addOrientationListener(handleOrientationChange);

    return () => {
      clearInterval(intervalIdRef.current);
      Orientation.removeOrientationListener(handleOrientationChange);
      // Unload the sound when the component unmounts
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, [fetchInterval]);

  const loadSound = async () => {
    try {
      await sound.current.loadAsync(require("../assets/audio/finish_nok.wav"));
    } catch (error) {
      //console.error("Error loading sound:", error);
    }
  };

  const checkTaskStatus = ({ tasks }, manual) => {
    const hasFalseStatus = tasks.some((task) => task.laststatus === "false");
    if (hasFalseStatus) {
      // Vibrate the device
      Vibration.vibrate();
      //console.log('VIBRATE');
      // Play the sound
      if (sound.current && manual) {
        sound.current.replayAsync();
      }
    }
  };

  const fetchData = async (init, manual) => {
    const connTimeout = 3000;

    const url = await AsyncStorage.getItem("url");
    const apiKey = await AsyncStorage.getItem("apiKey");

    setError("");
    setDetails([]);

    //console.log('URL:', url);
    //console.log('API Key:', apiKey);

    if (!url || !apiKey) {
      setLoading(false);
      setError("URL or API key is missing!");
      navigation.replace("login"); // Redirect to login if missing
      return;
    }

    try {
      // Flash
      if (!init) {
        setShowFlashMessage(true);
      }

      const fullUrl = `${url}/tasks/index.json?apiKey=${apiKey}`;
      // sort=id&direction=desc
      //console.log('Request:', fullUrl);

      // Fetch with custom timeout using Promise.race
      const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error("Request timed out!")), connTimeout); // Set timeout duration (e.g., 3000 ms)
      });

      const fetchPromise = fetch(fullUrl, {
        mode: "cors",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const response = await Promise.race([fetchPromise, timeoutPromise]);

      //console.log('HTTP Status:', `${response.status}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      //console.log('TASKS:', data);

      // Only serve active tasks
      data.tasks = data.tasks.filter((item) => item.active == "true");

      setTasks(data.tasks);

      checkTaskStatus(data, manual);

      // Cleanup timeout
      //return () => clearTimeout(timeoutId);
    } catch (error) {
      //console.error('Fetch error:', error.message); // Debug
      setError(error.message);
    } finally {
      try {
        setLoading(false); // Set loading to false after network request completes (whether successful or not)
      } catch (error) {
        console.error("Error in finally block:", error.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      clearInterval(intervalIdRef.current);
      await AsyncStorage.removeItem("url");
      await AsyncStorage.removeItem("apiKey");
      navigation.replace("login");
    } catch (error) {
      //console.error('Error logging out', error);
    }
  };

  const handleReload = () => {
    fetchData(false, true); // Trigger data fetching manually
  };

  return (
    <View style={styles.container} screenOptions={{ headerShown: false }}>
      <StatusBar barStyle="light-content" />
      {loading && <Text style={styles.loadingText}>Loading...</Text>}
      {error && <Text style={styles.errorText}>Error: {error}</Text>}
      {!loading && !error && (
        <FlatList
          style={styles.taskList}
          data={tasks}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.taskContainer,
                { backgroundColor: index % 2 === 0 ? "#222" : "#333" },
              ]}
              onPress={() => setDetails(item)}
            >
              <View
                style={[
                  styles.statusCircle,
                  {
                    backgroundColor:
                      item.laststatus === "true" ? "green" : "red",
                  },
                ]}
              />
              <Text
                style={styles.taskName}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
        />
      )}
      {orientation === "PORTRAIT" && !loading && (
        <View style={styles.separator} />
      )}
      {orientation === "PORTRAIT" && !loading && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
            <Text style={styles.buttonText}>Reload</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
      <Modal visible={!!error} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => setError("")}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={!!details.laststatus} transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.detailsTitle}>Task Details</Text>
            <View
              style={[
                styles.statusCircleDetails,
                {
                  backgroundColor:
                    details.laststatus === "true" ? "green" : "red",
                },
              ]}
            />
            <Text style={styles.detailsText}>
              <Text style={{ fontWeight: "bold" }}>Name</Text>
              <Text> : {details.name}</Text>
            </Text>
            <Text style={styles.detailsText}>
              <Text style={{ fontWeight: "bold" }}>Records</Text>
              <Text> : {details.records}</Text>
            </Text>
            <Text style={styles.detailsText}>
              <Text style={{ fontWeight: "bold" }}>Last executed</Text>
              <Text> : {details.lastexecuted}</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setDetails("")}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <FlashMessage
        message="Reload..."
        visible={showFlashMessage}
        onClose={() => setShowFlashMessage(false)}
      />
    </View>
  );
};

// [{"active": "false", "id": "1", "lastexecuted": "2023-12-07 22:47:34.0", "laststatus": "false", "name": "001-rest-in-hubspot-products", "records": "0"}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: "#ccc",
    backgroundColor: "#111111",
    paddingTop: 60,
    paddingBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  taskList: {
    flex: 1,
    paddingLeft: 0,
    width: "100%",
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
    backgroundColor: "#fff",
    backgroundColor: "#666666",
    borderRadius: 10, // Rounded edges for text input
  },
  loadingText: {
    fontSize: 32,
    color: "#fff",
    marginTop: 20,
  },
  taskContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 32,
    paddingLeft: 8,
    paddingTop: 8,
    paddingBottom: 8,
    marginRight: 0,
    marginBottom: 4,
    borderRadius: 6,
  },
  buttonContainer: {
    marginTop: 16,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reloadButton: {
    width: "48%",
    backgroundColor: "#b70",
    padding: 10,
    borderRadius: 10, // Rounded edges for button
    justifyContent: "center",
    alignItems: "center",
  },
  button: {
    width: "48%",
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
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  statusCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 10,
  },
  statusCircleDetails: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginTop: 4,
    marginBottom: 8,
    marginRight: 10,
  },
  taskName: {
    color: "#fff",
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
  detailsTitle: {
    fontSize: 18,
    color: "white",
    marginBottom: 10,
    textAlign: "left",
    fontWeight: "bold",
  },
  detailsText: {
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
  separator: {
    height: 1,
    backgroundColor: "#888", // Separator color
    width: "100%",
    marginBottom: 0,
  },
});

export default MainScreen;
