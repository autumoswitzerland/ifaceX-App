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


import { AppRegistry } from 'react-native';
import App from './App'; // Ensure this points to the App component
import { name as appName } from './app.json'; // The app name from app.json

AppRegistry.registerComponent(appName, () => App);
