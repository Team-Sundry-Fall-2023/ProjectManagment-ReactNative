import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { auth } from './firebase';
import { getUserRoleFromUserTable } from './FirebaseFunctions';
import { signInWithEmailAndPassword } from "firebase/auth";

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
      await signInWithEmailAndPassword(auth, email, password);
       // Get the user's ID
      const user = userCredential.user;
      const userId = user.uid;
     // Query the user's role from the user table
     const userRole = await getUserRoleFromUserTable(userId);

     // Determine which tab navigator to navigate to based on the user's role
    if (userRole === 'Admin') {
      navigation.navigate('AdminTabNavigator'); // Navigate to the admin tab bar
    } else if (userRole === 'Member') {
      navigation.navigate('MemberTabNavigator'); // Navigate to the member tab bar
    }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/icon.png')} // Provide the correct path to your logo
        style={styles.logo}
      />
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
  logo: {
    width: 100, // Adjust the width and height according to your logo's dimensions
    height: 100,
    alignSelf: 'center', // Center the logo horizontally
    marginBottom: 20,
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
