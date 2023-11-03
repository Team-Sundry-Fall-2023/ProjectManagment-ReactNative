import React, { useState,useContext } from 'react';
import { View, Text, TextInput, Button, Image, StyleSheet } from 'react-native';
import { auth, database } from './firebase';
import { getUserRoleFromUserTable } from './FirebaseFunctions';
import { signInWithEmailAndPassword } from "firebase/auth";
import {  ref, orderByChild, query, equalTo, get } from "firebase/database";
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
     if (user)
     {
      console.log('Login' + email);

      const userQuery = query(ref(database, 'users'), orderByChild('email'),equalTo(email) );
      get(userQuery).then((snapshot) => {
           if (snapshot.exists()) {
             // The snapshot contains the user data matching the email
             const user = snapshot.val();
        
             Object.keys(user).forEach((userId) => {
              const userData = user[userId];
              if (userData && userData.category) {
                const category = userData.category;
// const fn = userData.firstName;
// const ln = userData.lastName;
//                 console.log(fn);
//                 console.log(ln);
                //  const userData = {
                //    firstName: userData.firstName,
                //   lastName: userData.lastName,
                //   email: email,
                // };
                //  login(userData);
                setEmail('');
                setPassword('');

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
           
          setError('Error finding user:', error);
           return null;
         });


     // Determine which tab navigator to navigate to based on the user's role

  }else{
    setError('User not exist!');
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
      <Button title="Login" onPress={handleLogin} />
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
