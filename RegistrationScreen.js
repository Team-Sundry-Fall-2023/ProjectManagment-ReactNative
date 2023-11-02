import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { firebase } from './firebase';

const RegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegistration = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      // Perform input validation and show error messages
      return;
    }

    if (password !== confirmPassword) {
      // Passwords do not match, show an error message
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
      <Text style={styles.header}>Registration</Text>
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
