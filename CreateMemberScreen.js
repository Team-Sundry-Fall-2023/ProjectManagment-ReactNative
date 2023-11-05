import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { firebase, auth, database} from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get, push, update} from "firebase/database";
import RNPickerSelect from 'react-native-picker-select';

const CreateMemberScreen = ({ navigation, route }) => {
    const { members, setMembers, memberToEdit } = route.params;

    const [firstName, setFirstName] = useState(memberToEdit ? memberToEdit.firstName : '');
    const [lastName, setLastName] = useState(memberToEdit ? memberToEdit.lastName : '');
    const [email, setEmail] = useState(memberToEdit ? memberToEdit.email : '');
    const [password, setPassword] = useState('');
    const [hourlyRate, setHourlyRate] = useState(memberToEdit ? memberToEdit.hourlyRate : 0);
    const [selectedRole, setSelectedRole] = useState(memberToEdit ? memberToEdit.category : null);
    const roleOptions = {
      'Admin': "Admin",
      'Member': "Member",
    };

    const handleCreateMember = async () => {
      // Validate input fields
      if (!firstName || !lastName || !email || !password || !hourlyRate) {
        showAlert('Error','All fields are required.'); // Show an alert
        return;
      }

      // Validate the email format
      if (!validateEmail(email)) {
        showAlert('Error','Invalid email format.'); // Show an alert
        return;
      }

      try {
        const userRef = ref(database,'users');
        const userData = {
          firstName : firstName,
          lastName :lastName,
          email : email.toLowerCase(),
          hourlyRate:parseFloat(hourlyRate), 
          category: selectedRole ? selectedRole : 'Member',
        };
        console.log(userData);
        push(userRef, userData)
        .then(() => {
          showAlert('Success','User added successfully');
          createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed up 
            const user = userCredential.user;
            console.log('Register' +user);

            const newMember = {
              ...userData, // Use the userData object to represent the member's data
            };
            setMembers([...members, newMember]);
            navigation.goBack();
          })
          .catch((error) => {
            console.log('Register Error' +error.message)
            const errorCode = error.code;
            const errorMessage = error.message;
            showAlert('Error','Error adding user:', error.message);
            // ..
          });
        })
        .catch((error) => {
          showAlert('Error','Error adding user:'+ error);
        });
  
      } catch (error) {
        showAlert('Error creating member. Please try again.'); // Show an alert
        console.error('Error creating member:'+ error);
      }
    };

    const handleUpdateMember = async () => {
      // Validate input fields
      if (!firstName || !lastName || !email || !hourlyRate) {
        showAlert('Error', 'All fields are required.'); // Show an alert
        return;
      }

      const lowerCaseEmail = memberToEdit.email.toLowerCase();
    
      try {
        const usersRef = ref(database, 'users');
        const userQuery = query(usersRef, orderByChild('email'), equalTo(email));
    
        // Fetch the member data
        get(userQuery)
          .then((snapshot) => {
            if (snapshot.exists()) {
              const editMember = snapshot.val();
              const userId = Object.keys(editMember)[0]; // Assuming there's only one member with a given email
    
              // Construct the updated member data
              const updatedUserData = {
                firstName: firstName,
                lastName: lastName,
                email: lowerCaseEmail,
                hourlyRate: parseFloat(hourlyRate),
                category: selectedRole || 'Member',
              };
    
              // Update the member in the database
              update(ref(database, `users/${userId}`), updatedUserData)
                .then(() => {
                  showAlert('Success', 'Member updated successfully');
                  const updatedMember = {
                    ...updatedUserData,
                  };
                  const updatedMembersList = members.map((member) =>
                    member.email === lowerCaseEmail ? updatedMember : member
                  );
                  setMembers(updatedMembersList);
                  navigation.goBack();
                })
                .catch((error) => {
                  console.error('Error updating member:', error);
                });
            } else {
              showAlert('Error', 'No member found with the provided email.');
            }
          })
          .catch((error) => {
            showAlert('Error', 'Error finding member: ' + error);
          });
      } catch (error) {
        showAlert('Error', 'Error updating member: ' + error);
        console.error('Error updating member:', error);
      }
    };
  // Email validation function
  const validateEmail = (email) => {
    // Use a regular expression to validate email format
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  // Function to show an alert with the error message
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.customHeaderLeft}>
          <Button
            onPress={() => navigation.goBack()}
            title="< Back"
            color="#007BFF"
          />
        </View>
      ),
      headerTitle: () => (
        <View style={styles.customHeader}>
          <Text style={styles.headerTitle}>{memberToEdit ? 'Edit member' : 'Add member'}</Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
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
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={memberToEdit ? false : true}
      />
      {!memberToEdit && (
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      )}
      <TextInput
        style={styles.input}
        placeholder="Hourly Rate"
        value={hourlyRate.toString()}
        onChangeText={setHourlyRate}
        keyboardType="numeric"
      />
      <View>
        <RNPickerSelect
        items={[
          ...Object.entries(roleOptions).map(([value, label]) => ({
            label,
            value: value,
          })),
        ]}
        value={selectedRole} // Set the selected value (if needed)
        onValueChange={(value) => setSelectedRole(value)}
        style={{
          inputIOS: {
            fontSize: 16,
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: 'gray',
            borderRadius: 4,
            color: 'black',
          },
        }}
      />
      </View>
      
      <Button title={memberToEdit ? "Update" : "Save"} onPress={memberToEdit ? handleUpdateMember : handleCreateMember} />
    </View>
  );
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
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 'auto',
  },
  customHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default CreateMemberScreen;
