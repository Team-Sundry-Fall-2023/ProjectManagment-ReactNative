import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { firebase } from './firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format.'); // Show an alert
      return;
    }

    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      // Navigate to the main app screen after successful login
      // You can replace 'MainScreen' with your main app screen component
      navigation.replace('TabNavigator');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
       style={styles.input}
        placeholder="Email"
        onChangeText={setEmail}
      />
      <TextInput
       style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Text style={styles.errorText}>{error}</Text>
      <Button title="Login" onPress={login} />
      <Button title="Register" onPress={() => navigation.navigate('Registration')} />
    </View>
  );
}

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
  errorText: {
    color: 'red',
  },
});
