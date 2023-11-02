import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
// import { firebase } from './firebase';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/database'; 

const RegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegistration = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert('All fields are required.'); 
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Password mismatch.'); 
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Invalid email format.'); // Show an alert
      return;
    }

    try {
      // Create the user in Firebase Authentication
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);

      // Store additional user data in Firebase Firestore
      const user = userCredential.user;
      const userRef = firebase.firestore().collection('users').doc(user.uid);
      await userRef.set({
        firstName,
        lastName,
        email,
        category: 'Admin', // Set the category to "Admin" for every user
      });

      // Navigate to another screen (e.g., the main app screen) upon successful registration
      navigation.navigate('MainScreen');
    } catch (error) {
      console.error('Error registering user:', error);
      // Handle registration error and show an error message
    }
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
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Button title="Register" onPress={handleRegistration} />
    </View>
  );
};

const showAlert = (message) => {
  Alert.alert('Error', message, [{ text: 'OK' }], { cancelable: false });
};

  // Email validation function
  const validateEmail = (email) => {
    // Use a regular expression to validate email format
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
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

export default RegistrationScreen;
