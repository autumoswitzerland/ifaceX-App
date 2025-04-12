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

import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as SecureStore from "expo-secure-store";
import LoginScreen from "../login";
import MainScreen from "../main";

const Stack = createNativeStackNavigator();

const TabsNavigator = () => {
  const [initialRouteName, setInitialRouteName] = useState("login");

  useEffect(() => {
    const checkLogin = async () => {
      const url = await SecureStore.getItemAsync("url");
      const apiKey = await SecureStore.getItemAsync("apiKey");

      //console.log('Values read from DB ->');
      //console.log('URL:', url);
      //console.log('API Key:', apiKey);

      if (url && apiKey) {
        setInitialRouteName("main");
      }
    };
    checkLogin();
  }, []);

  return (
    <Stack.Navigator initialRouteName={initialRouteName}>
      {initialRouteName == "login" && (
        <Stack.Screen
          name="login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
      {initialRouteName == "main" && (
        <Stack.Screen
          name="main"
          component={MainScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default TabsNavigator;
