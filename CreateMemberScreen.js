import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase, auth} from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";

const CreateMemberScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');

  const handleCreateMember = async () => {
    // Validate input fields
    if (!firstName || !lastName || !email || !password || !hourlyRate) {
      showAlert('All fields are required.'); // Show an alert
      return;
    }

    // Validate the email format
    if (!validateEmail(email)) {
      showAlert('Invalid email format.'); // Show an alert
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
      hourlyRate:parseFloat(hourlyRate), // Convert hourlyRate to a number
      category: 'Memebr', 
    };
    push(userRef, userData)
    .then(() => {
      showAlert('User added successfully');
    })
    .catch((error) => {
      showAlert('Error adding user:', error);
    });
    
  })
  .catch((error) => {
    console.log('Register Error' +error.message)
    const errorCode = error.code;
    const errorMessage = error.message;
    showAlert('Error adding user:', error.message);
    // ..
  });
 
    } catch (error) {
      showAlert('Error creating member. Please try again.'); // Show an alert
      console.error('Error creating member:', error);
    }
  };

  // Email validation function
  const validateEmail = (email) => {
    // Use a regular expression to validate email format
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  // Function to show an alert with the error message
  const showAlert = (message) => {
    Alert.alert('Error', message, [{ text: 'OK' }], { cancelable: false });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Member</Text>
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
