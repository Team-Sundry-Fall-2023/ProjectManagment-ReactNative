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
        placeholder="Email"
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
      />
      <Text style={styles.errorText}>{error}</Text>
      <Button title="Login" onPress={login} />
      <Button title="Register" onPress={() => navigation.navigate('RegistrationScreen')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
});
