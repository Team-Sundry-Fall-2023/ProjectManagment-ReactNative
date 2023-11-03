import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, push } from "firebase/database";
import 'firebase/auth';
import 'firebase/database'; 
import { createUserWithEmailAndPassword } from "firebase/auth";
import UserContext from './UserContext';


const RegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useContext(UserContext);

  const handleRegistration = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert('Error','All fields are required.'); 
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error','Password mismatch.'); 
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Error','Invalid email format.'); // Show an alert
      return;
    }

    try {

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    console.log('Register' +user)
    const userRef = ref(database,'users');
    console.log('Register ref' + userRef)
   
    const userData = {
      firstName : firstName,
      lastName :lastName,
      email : email,
      hourlyRate:0,
      category: 'Admin', // Set the category to "Admin" for every user
    };
    push(userRef, userData)
    .then(() => {
      showAlert('Success','User added successfully');
      const userData = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      };
      login(userData);
      navigation.navigate('AdminTabNavigator');
    })
    .catch((error) => {
      showAlert('Error','Error adding user:'+ error);
    });
    
  })
  .catch((error) => {
    console.log('Register Error' +error.message)
    const errorCode = error.code;
    const errorMessage = error.message;
    showAlert('Error','Error adding user:', error.message);
    // ..
  });
      // Create the user in Firebase Authentication
      // const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // Store additional user data in Firebase Firestore
      
      

      // Navigate to another screen (e.g., the main app screen) upon successful registration
   
    } catch (error) {
      console.error('Error registering user:'+ error);
      showAlert('Error','Error adding user:', error.message);
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

const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
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
