import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase, auth, database} from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import {  ref, push } from "firebase/database";

const CreateMemberScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleCreateMember = async () => {
    // Validate input fields
    if (!firstName || !lastName || !email || !password || !hourlyRate) {
      showAlert('Error','All fields are required.'); // Show an alert
      return;
    }

    // Validate the email format
    if (!validateEmail(email)) {
      showAlert('Error','Invalid email format.'); // Show an alert
      return;
    }

    try {
      const userRef = ref(database,'users');
      console.log('Register ref' + userRef)
      const userData = {
        firstName : firstName,
        lastName :lastName,
        email : email,
        hourlyRate:parseFloat(hourlyRate), // Convert hourlyRate to a number
        category: 'Memebr', 
      };
      push(userRef, userData)
      .then(() => {
        showAlert('Success','User added successfully');
            // Clear text fields
            setFirstName('');
            setLastName('');
            setEmail('');
            setPassword('');
            setHourlyRate('');
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;
          console.log('Register' +user)
         
          
        })
        .catch((error) => {
          console.log('Register Error' +error.message)
          const errorCode = error.code;
          const errorMessage = error.message;
          showAlert('Error','Error adding user:', error.message);
          // ..
        });
      })
      .catch((error) => {
        showAlert('Error','Error adding user:'+ error);
      });
 
    } catch (error) {
      showAlert('Error creating member. Please try again.'); // Show an alert
      console.error('Error creating member:'+ error);
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    // Use a regular expression to validate email format
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  // Function to show an alert with the error message
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Hourly Rate"
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="numeric"
      />
      <Button title="Create Member" onPress={handleCreateMember} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CreateMemberScreen;
