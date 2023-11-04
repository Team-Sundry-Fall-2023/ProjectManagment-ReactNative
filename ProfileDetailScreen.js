import React, { useEffect, useState,useContext } from 'react';
import { View, Text, Button, StyleSheet, Image, Alert } from 'react-native';
import UserContext from './UserContext';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const ProfileDetailScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const { user, logout } = useContext(UserContext);

  useEffect(() => {
    // Fetch the currently authenticated user's details
    const currentUser = auth.currentUser;

    if (currentUser) {

      const userQuery = query(
        ref(database, 'users'),
        orderByChild('email'),
        equalTo(currentUser.email)
      );
  
      get(userQuery)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const users = snapshot.val();
            Object.keys(users).forEach((userId) => {
              const userData = users[userId];
              if (userData ) {
                setUserDetails ({
                  firstName: userData.firstName,
                  lastName :userData.lastName,
                  category : userData.category,
                  email: userData.email,
                });
           
              } else {
                setError('User not fount', userId);
              }
            });
            
          }
        })
        .catch((error) => {
          console.error('Error fetching Users:', error);
        });
    }
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here, such as signing the user out
    auth.signOut()
      .then(() => {
        logout();
        // After successful sign-out, navigate back to the login screen or perform any other actions
        navigation.navigate('Login');
      })
      .catch(error => {
        // Handle sign-out error
        console.error('Error during sign-out:'+ error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Details</Text>
      <Image
        source={require('./assets/icon.png')} // Provide the correct path to your logo
        style={styles.logo}
      />
      {userDetails ? (
        <View style={styles.userDetails}>
          <Text>First Name: {userDetails.firstName}</Text>
          <Text>Last Name: {userDetails.lastName}</Text>
          <Text>Email: {userDetails.email}</Text>
          <Text>Category: {userDetails.category}</Text>
        </View>
      ) : (
        <Text>Loading user details...</Text>
      )}
      <Button
        title="Edit Profile"
        onPress=
        {() => navigation.navigate('EditProfile', { profileObj: userDetails })}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  userDetails: {
    marginBottom: 20,
  },
  logo: {
    width: 100, // Adjust the width and height according to your logo's dimensions
    height: 100,
    alignSelf: 'center', // Center the logo horizontally
    marginBottom: 20,
  },
});

export default ProfileDetailScreen;
