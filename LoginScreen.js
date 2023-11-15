import React, { useState, useContext } from 'react';
import { StyleSheet, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { View, Text, TextField, Button, Image, Colors } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, orderByChild, query, equalTo, get } from "firebase/database";
import UserContext from './UserContext';
import { Header } from 'react-native-elements';
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
      setError('Invalid email format.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      if (user) {
        console.log('Login' + email);
        setEmail('');
        setPassword('');
        setError('');
        const userQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));

        get(userQuery).then((snapshot) => {
          if (snapshot.exists()) {
            const user = snapshot.val();

            Object.keys(user).forEach((userId) => {
              const userData = user[userId];
              if (userData && userData.category) {
                const category = userData.category;

                if (category === 'Admin') {
                  navigation.navigate('AdminTabNavigator');
                } else if (category === 'Member') {
                  navigation.navigate('MemberTabNavigator');
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

  const handleRegister = () => {
    setError('');
    navigation.navigate('Registration');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          containerStyle={styles.headerContainer}
          centerComponent={{ text: ' ', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
          backgroundColor='#fff'
        />
        <Image
          source={require('./assets/img/tiny_people.png')}
          style={styles.logo}
        />
        <Text style={styles.appTitle}>PROJECT MANAGEMENT</Text>
        <TextField
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          validate={{
            email: (value) => validateEmail(value) || 'Invalid email format',
          }}
          validationMessage={error}
        />
        <TextField
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          validate={{
            password: (value) => !!value || 'Password is required',
          }}
          validationMessage={error}
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button label="Login" onPress={handleLogin} style={styles.button} />
        <Button label="Register" backgroundColor={Colors.blue1} onPress={handleRegister} style={styles.button} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const validateEmail = (email) => {
  const emailPattern = /\S+@\S+\.\S+/;
  return emailPattern.test(email);
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 0,
    marginBottom: 100
  },
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
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
    alignSelf: 'center',
  },
  button: {
    alignSelf: 'center',
    width: 250,
    marginBottom: 10,
  }
});
