import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TextField, Button } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { ref, push } from "firebase/database";
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
      showAlert('Error', 'Invalid email format.'); // Show an alert
      return;
    }

    try {

      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          // Signed up 
          const user = userCredential.user;
          console.log('Register' + user)
          const userRef = ref(database, 'users');
          console.log('Register ref' + userRef)

          const userData = {
            firstName: firstName,
            lastName: lastName,
            email: email.toLowerCase(),
            hourlyRate: 0,
            category: 'Admin', // Set the category to "Admin" for every user
          };
          push(userRef, userData)
            .then(() => {
              showAlert('Success', 'User added successfully');
              // const userData = {
              //   firstName: userData.firstName,
              //   lastName: userData.lastName,
              //   email: userData.email,
              // };
              // login(userData);
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
          // ..
        });
      // Create the user in Firebase Authentication
      // const userCredential = await auth.createUserWithEmailAndPassword(email, password);

      // Store additional user data in Firebase Firestore



      // Navigate to another screen (e.g., the main app screen) upon successful registration

    } catch (error) {
      console.error('Error registering user:' + error);
      showAlert('Error', 'Error adding user:', error.message);
      // Handle registration error and show an error message
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.fieldContainer}>
        <Text text70 style={styles.label}>First Name</Text>
        <TextField
          style={styles.input}
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
          enableErrors={true}
          error={error}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text text70 style={styles.label}>Last Name</Text>
        <TextField
          style={styles.input}
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
          enableErrors={true}
          error={error}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text text70 style={styles.label}>Email</Text>

        <TextField
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          enableErrors={true}
          error={error}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text text70 style={styles.label}>Password</Text>

        <TextField
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          enableErrors={true}
          error={error}
        />
      </View>
      <View style={styles.fieldContainer}>
        <Text text70 style={styles.label}>Confirm Password</Text>

        <TextField
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          enableErrors={true}
          error={error}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button label="Register" onPress={handleRegistration} style={styles.button} />
      {/* <Button label="Back to Login" onPress={() => navigation.navigate('Login')} style={[styles.button, styles.lastButton]} /> */}
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
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 50,
    padding: 16,
    alignItems: 'center', // This ensures all child elements are aligned in the center
  },
  input: {
    height: 40,
    width: 280, // Set a fixed width for the TextFields
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20, // This is half of the height to make the TextField rounded
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    width: 280, // Set a fixed width for the buttons to match the TextFields
    marginBottom: 10,
  }, fieldContainer: {
  },
  label: {
    alignSelf: 'flex-start', // Aligns the text to the start of the flex container
  },
});

export default RegistrationScreen;
