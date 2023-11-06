import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Button } from 'react-native-ui-lib';
import UserContext from './UserContext';
import { firebase, auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { LinearGradient } from 'expo-linear-gradient';

const ProfileDetailScreen = ({ navigation }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(UserContext);

  useEffect(() => {
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
            const userData = Object.values(users)[0]; // Assuming unique email, so take the first user data
            setUserDetails({
              firstName: userData.firstName,
              lastName: userData.lastName,
              category: userData.category,
              email: userData.email,
            });
            setLoading(false);
          } else {
            setError('User not found');
            setLoading(false);
          }
        })
        .catch((error) => {
          console.error('Error fetching Users:', error);
          setLoading(false);
        });
    }
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        logout();
        navigation.navigate('Login');
      })
      .catch(error => {
        console.error('Error during sign-out: ' + error);
      });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        // Array of colors to create the gradient from top to bottom
        colors={['#4c669f', '#3b5998', '#192f6a']}
        style={styles.gradientHeader}
      >
      </LinearGradient>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={require('./assets/img/avatar.jpg')} // Replace with the user's avatar image if available
            style={styles.avatar}
          />
        </View>
        <View style={styles.detailContainer}>
          <Text style={styles.name}>{userDetails.firstName} {userDetails.lastName}</Text>
          <Text style={styles.category}>{userDetails.category}</Text>
          <Text style={styles.email}>{userDetails.email}</Text>
        </View>
        <Button label="Edit Profile" onPress={() => navigation.navigate('Edit Profile', { profileObj: userDetails })} style={styles.button} />
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7', // or any background color you want for the rest of the screen
  },
  gradientHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 265, // This is the height of your gradient header
  },
  content: {
    paddingTop: 200, // This should be the same as the height of your gradient header
  },
  headerTitle: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerImage: {
    width: '100%',
    height: 200, // Adjust based on your header image aspect ratio
  },
  avatarContainer: {
    position: 'absolute',
    top: 150, // Adjust based on your header image height
    alignSelf: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50, // Circular avatar
    borderWidth: 4,
    borderColor: 'white', // White border for avatar
  },
  detailContainer: {
    marginTop: 60, // Adjust based on avatar size
    padding: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  category: {
    fontSize: 18,
    textAlign: 'center',
    color: '#6d6d6d', // Dark grey for less emphasis
    marginTop: 4,
  },
  email: {
    fontSize: 16,
    textAlign: 'center',
    color: '#a0a0a0', // Light grey for even less emphasis
    marginTop: 4,
  },
  button: {
    marginHorizontal: 50,
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'center',
  },
  logoutText: {
    fontSize: 18,
    color: '#ff3b30', // iOS system red color for destructive actions
  },
});

export default ProfileDetailScreen;
