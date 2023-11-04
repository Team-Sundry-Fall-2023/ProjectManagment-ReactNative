import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, update } from "firebase/database";
import 'firebase/auth';
import 'firebase/database'; 
import { updatePassword } from "firebase/auth";
import { useNavigation, useRoute } from '@react-navigation/native';


const EditProfileScreen = ({  }) => {
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
      showAlert('Error','All fields are required.'); 
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error','Password mismatch.'); 
      return;
    }

    const user = auth.currentUser; // Get the current authenticated user

// Use the `updatePassword` method to update the user's password
updatePassword(user, password)
  .then(() => {
    showAlert('Success', 'Password updated');


    const userQuery = query(ref(database, 'users'), orderByChild('email'), equalTo(user.email));

    // Fetch the project data
    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const userEmail = Object.keys(users)[0]; // Assuming there's only one project with a given ID


          const updatedUsertData = {
            firstName : firstName,
            lastName :lastName,
          };

          // Update the project in the database
          update(ref(database, `users/${userEmail}`), updatedUsertData)
            .then(() => {
              // Project data has been successfully updated
              showAlert('Success', 'User data updated');
              navigation.goBack();
            })
            .catch((error) => {
              // Handle the error if the update fails
              showAlert('Error', 'Error updating user data:' + error);
            });
        } else {
          console.log('User not found'); // Handle the case where the project is not found
        }
      })
      .catch((error) => {
        // Handle the error if the fetch fails
        showAlert('Error', 'Error finding user:' + error);
      });




  })
  .catch((error) => {
    showAlert('Error', 'Error updating password: ' + error);
  });

  };

  return (
    <View style={styles.container}>
       <Text>Email: {email}</Text>
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
      <Button title="Register" onPress={handleEditProfile} />
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

export default EditProfileScreen;
