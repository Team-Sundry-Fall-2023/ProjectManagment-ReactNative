import React, { useState, useContext } from 'react';
import { StyleSheet } from 'react-native';
import { View, Text, TextField, Button, Image, Colors } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, orderByChild, query, equalTo, get } from "firebase/database";
import UserContext from './UserContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(UserContext);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format.'); // Show an alert
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Get the user's ID
      const user = userCredential.user;
      if (user) {
        console.log('Login' + email);
        setEmail('');
        setPassword('');
        setError('');
        const userQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));

        get(userQuery).then((snapshot) => {
          if (snapshot.exists()) {
            // The snapshot contains the user data matching the email
            const user = snapshot.val();

            Object.keys(user).forEach((userId) => {
              const userData = user[userId];
              if (userData && userData.category) {
                const category = userData.category;

                if (category === 'Admin') {
                  navigation.navigate('AdminTabNavigator'); // Navigate to the admin tab bar
                } else if (category === 'Member') {
                  navigation.navigate('MemberTabNavigator'); // Navigate to the member tab bar
                }
              } else {
                setError('Category not found for user with ID', userId);
              }
            });
          } else {
            setError('User not found.');
          }
        }).catch((error) => {

          setError('Error finding user:' + error);
          return null;
        });

      } else {
        setError('User not exist!');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./assets/img/tiny_people.jpg')}
        style={styles.logo}
      />
      <TextField
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        enableErrors={true} // RNUILib TextField specific props
        error={error} // Display the error directly in the TextField
      />
      <TextField
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        enableErrors={true}
        error={error}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <Button label="Login" onPress={handleLogin} style={styles.button} />
      <Button label="Register" backgroundColor={Colors.blue1} onPress={() => navigation.navigate('Registration')} style={styles.button} />
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
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 390,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
  },
  input: {
    width: 400,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    maxWidth: 340, // Ensures the TextField is not wider than the buttons
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  button: {
    alignSelf: 'center',
    width: 250, // Set a fixed width for the buttons to match the TextFields
    marginBottom: 10,
  }
});
