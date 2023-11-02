import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { firebase,auth } from './firebase'; // Import your Firebase configuration

const ProfileDetailScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);

  useEffect(() => {
    // Fetch the currently authenticated user's details
    const currentUser = auth.currentUser;

    if (currentUser) {
      setUserDetails({
        firstName: currentUser.displayName,
        email: currentUser.email,
        // Add more user details as needed
      });
    }
  }, []);

  const handleLogout = () => {
    // Implement your logout logic here, such as signing the user out
    firebase.auth().signOut()
      .then(() => {
        // After successful sign-out, navigate back to the login screen or perform any other actions
        navigation.navigate('Login');
      })
      .catch(error => {
        // Handle sign-out error
        console.error('Error during sign-out:', error);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profile Details</Text>
      {userDetails ? (
        <View style={styles.userDetails}>
          <Text>Name: {userDetails.firstName}</Text>
          <Text>Email: {userDetails.email}</Text>
          {/* Add more user details here */}
        </View>
      ) : (
        <Text>Loading user details...</Text>
      )}
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
});

export default ProfileDetailScreen;
