import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Keyboard , TouchableWithoutFeedback } from 'react-native';
import { Button, TextField, Text } from 'react-native-ui-lib'; // Import from 'react-native-ui-lib'
import { useNavigation, useRoute } from '@react-navigation/native';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";
import { updatePassword } from "firebase/auth";
import { auth, database } from './firebase';
import 'firebase/auth';
import 'firebase/database';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

const EditProfileScreen = ({ }) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profileObj } = route.params;
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (profileObj) {
      setProfile(profileObj);
    }
  }, [profileObj, profile]);

  useEffect(() => {
    if (profile) {
      setLastName(profile.lastName);
      setFirstName(profile.firstName)
      setEmail(profile.email)
    } else {

    }

  }, [profile]);

  const handleEditProfile = async () => {
    if (!firstName || !lastName || !password || !confirmPassword) {
      showAlert('Error', 'All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Password mismatch.');
      return;
    }

    const user = auth.currentUser;

    updatePassword(user, password)
      .then(() => {
        showAlert('Success', 'Password updated');

        const userQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));

        get(userQuery)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const users = snapshot.val();
              const userEmail = Object.keys(users)[0];

              const updatedUsertData = {
                firstName: firstName,
                lastName: lastName,
              };

              update(ref(database, `users/${userEmail}`), updatedUsertData)
                .then(() => {
                  showAlert('Success', 'User data updated');
                  navigation.goBack();
                })
                .catch((error) => {
                  showAlert('Error', 'Error updating user data:' + error);
                });
            } else {
              console.log('User not found');
            }
          })
          .catch((error) => {
            showAlert('Error', 'Error finding user:' + error);
          });
      })
      .catch((error) => {
        showAlert('Error', 'Error updating password: ' + error);
      });
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  // Email validation function
  const validateEmail = (email) => {
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          containerStyle={styles.headerContainer}
          leftComponent={
            <Ionicons
              name='ios-arrow-back'
              size={24}
              color='#000'
              onPress={() => navigation.goBack()}
            />
          }
          centerComponent={{ text: profileObj.email, style: { color: '#000', fontSize: 18, fontWeight: 'bold' } }}
          backgroundColor='#fff'
        />
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>First Name</Text>
            <TextField
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextField
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />

            <Text style={styles.label}>Password</Text>
            <TextField
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />

            <Text style={styles.label}>Confirm Password</Text>
            <TextField
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              style={styles.input}
            />
            <Button label="Update" onPress={handleEditProfile} style={styles.button} />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  scrollViewContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  labelEmail: {
    fontWeight: 'bold',
    fontSize: 20,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: '#5848ff',
    alignSelf: 'center',
    width: '50%',
  },
});

export default EditProfileScreen;
