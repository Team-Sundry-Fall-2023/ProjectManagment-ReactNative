import React, { useState, useContext } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { View, Text, TextField, Button, Image } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { ref, push } from "firebase/database";
import 'firebase/auth';
import 'firebase/database';
import { createUserWithEmailAndPassword } from "firebase/auth";
import UserContext from './UserContext';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

const RegistrationScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { login } = useContext(UserContext);
  const [error, setError] = useState('');

  const handleRegistration = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Password mismatch.');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Error', 'Invalid email format.');
      return;
    }

    try {

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log('Register' + user)
          const userRef = ref(database, 'users');
          console.log('Register ref' + userRef)

          const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(),
            hourlyRate: 0,
            category: 'Admin',
          };
          push(userRef, userData)
            .then(() => {
              showAlert('Success', 'User added successfully');
              navigation.navigate('AdminTabNavigator');
            })
            .catch((error) => {
              showAlert('Error', 'Error adding user:' + error);
            });

        })
        .catch((error) => {
          console.log('Register Error' + error.message)
          const errorCode = error.code;
          const errorMessage = error.message;
          showAlert('Error', 'Error adding user:', error.message);
        });

    } catch (error) {
      console.error('Error registering user:' + error);
      showAlert('Error', 'Error adding user:', error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          containerStyle={styles.headerContainer}
          centerComponent={{ text: 'Registration', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
          backgroundColor='#87CEEB'
        />
        <ScrollView style={styles.scrollViewContainer}>
          <Image
            source={require('./assets/img/tiny_people.png')}
            style={styles.logo}
          />
          <Text style={styles.appTitle}>PROJECT MANAGEMENT</Text>
          <View style={styles.fieldContainer}>
            <TextField
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              validate={{ presence: true }}
              validationMessage={error}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextField
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              validate={{ presence: true }}
              validationMessage={error}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextField
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              validate={{ email: true }}
              validationMessage={error}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextField
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              validate={{ email: true }}
              validationMessage={error}
            />
          </View>
          <View style={styles.fieldContainer}>
            <TextField
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              validate={{ email: true }}
              validationMessage={error}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button label="Register" onPress={handleRegistration} style={styles.button} />
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? Back to login</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
};

const validateEmail = (email) => {
  const emailPattern = /\S+@\S+\.\S+/;
  return emailPattern.test(email);
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  scrollViewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 300,
    height: 210,
    alignSelf: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007BFF',
    marginBottom: 20,
    alignSelf: 'center',
  },
  input: {
    width: 400,
    height: 40,
    borderColor: '#87CEEB',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    maxWidth: 340,
    alignSelf: 'center',
    marginBottom: 10,
    color: '#87CEEB',
    placeholderTextColor: '#87CEEB',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#5848ff',
    borderRadius: 20,
    alignSelf: 'center',
    width: '50%',
  },
  label: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#007BFF',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default RegistrationScreen;
