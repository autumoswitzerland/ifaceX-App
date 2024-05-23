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

import React, { useEffect, useState } from 'react';
import { Alert, View, Text, Button, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MainScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchData = async () => {

      const timeoutInMs = 3000;

      const url = await AsyncStorage.getItem('url');
      const apiKey = await AsyncStorage.getItem('apiKey');

      setError('');
      setDetails([]);

      //console.log('URL:', url);
      //console.log('API Key:', apiKey);

      if (!url || !apiKey) {
        setError('URL or API key is missing!');
        setLoading(false);

        //navigation.navigate('Login')
        navigation.replace('login'); // Redirect to login if missing
        return;
      }

      try {

        const fullUrl = `${url}/tasks/index.json?apiKey=${apiKey}`;
        // sort=id&direction=desc
        //console.log('Request:', fullUrl);

        // Fetch with custom timeout using Promise.race
        const timeoutPromise = new Promise((resolve, reject) => {
          setTimeout(() => reject(new Error('Request timed out!')), timeoutInMs); // Set timeout duration (e.g., 3000 ms)
        });

        const fetchPromise = fetch(fullUrl, {
          mode: 'no-cors',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
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
        data.tasks = data.tasks.filter(item => item.active == 'true');

        setTasks(data.tasks);

      } catch (error) {
        //console.error('Fetch error:', error.message); // Debug
        setError(error.message);
      } finally {
          try {
                setLoading(false); // Set loading to false after network request completes (whether successful or not)
              } catch (error) {
                console.error('Error in finally block:', error.message);
              }
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
     try {
       await AsyncStorage.removeItem('url');
       await AsyncStorage.removeItem('apiKey');
       //navigation.navigate('Login')
       navigation.replace('login');
     } catch (error) {
       //console.error('Error logging out', error);
     }
   };

   return (
     <View style={styles.container}>
       {loading && (
         <Text style={styles.loadingText}>Loading...</Text>
       )}
       {error && (
         <Text style={styles.errorText}>Error: {error}</Text>
       )}
       {!loading && !error && (
         <FlatList
           data={tasks}
           renderItem={({ item }) => (
             <TouchableOpacity style={styles.taskContainer} onPress={() => setDetails(item)}>
               <View style={[styles.statusCircle, { backgroundColor: item.laststatus === 'true' ? 'green' : 'red' }]} />
               <Text style={styles.taskName}>{item.name}</Text>
             </TouchableOpacity>
           )}
           keyExtractor={(item) => item.id.toString()}
         />
       )}
       <TouchableOpacity
         style={styles.button}
         onPress={handleLogout}>
         <Text style={styles.buttonText}>Logout</Text>
       </TouchableOpacity>
       <Modal visible={!!error} transparent>
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <Text style={styles.errorTitle}>Error</Text>
             <Text style={styles.errorText}>{error}</Text>
             <TouchableOpacity onPress={() => setError('')} style={styles.closeButton}>
               <Text style={styles.closeButtonText}>OK</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
       <Modal visible={!!details.laststatus} transparent>
         <View style={styles.modalContainer}>
           <View style={styles.modalContent}>
             <Text style={styles.detailsTitle}>Task Details</Text>
             <View style={[styles.statusCircleDetails, { backgroundColor: details.laststatus === 'true' ? 'green' : 'red' }]} />
             <Text style={styles.detailsText}>
               <Text style={{fontWeight: "bold"}}>Name</Text>
               <Text> : {details.name}</Text>
             </Text>
             <Text style={styles.detailsText}>
               <Text style={{fontWeight: "bold"}}>Records</Text>
               <Text> : {details.records}</Text>
             </Text>
             <Text style={styles.detailsText}>
               <Text style={{fontWeight: "bold"}}>Last executed</Text>
               <Text> : {details.lastexecuted}</Text>
             </Text>
             <TouchableOpacity onPress={() => setDetails('')} style={styles.closeButton}>
               <Text style={styles.closeButtonText}>OK</Text>
             </TouchableOpacity>
           </View>
         </View>
       </Modal>
     </View>
   );
}

// [{"active": "false", "id": "1", "lastexecuted": "2023-12-07 22:47:34.0", "laststatus": "false", "name": "001-rest-in-hubspot-products", "records": "0"}

const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#111111',
      paddingTop: 60,
      paddingBottom: 40,
      paddingLeft: 20,
      paddingRight: 20,
      justifyContent: 'center',
      alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
    backgroundColor: '#666666',
    borderRadius: 10, // Rounded edges for text input
  },
  loadingText: {
    fontSize: 32,
    color: '#fff',
    marginTop: 20,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    width: '80%',
    backgroundColor: '#07b',
    padding: 10,
    borderRadius: 10, // Rounded edges for button
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  buttonText: {
    color: '#fff',
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
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 10,
    textAlign: 'left',
  },
  errorTitle: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  errorText: {
    color: 'white',
    marginBottom: 10,
    textAlign: 'left',
  },
  detailsTitle: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  detailsText: {
    color: 'white',
    marginBottom: 10,
    textAlign: 'left',
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#07b',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
  },
});

export default MainScreen;
