import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button, TextField, Text } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get, push, update } from "firebase/database";
import RNPickerSelect from 'react-native-picker-select';
import commonStyles from './style';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

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
    if (!firstName || !lastName || !email || !password || !hourlyRate) {
      showAlert('Error', 'All fields are required.');
      return;
    }

    if (!validateEmail(email)) {
      showAlert('Error', 'Invalid email format.');
      return;
    }

    try {
      const userRef = ref(database, 'users');
      const userData = {
        firstName: firstName,
        lastName: lastName,
        email: email.toLowerCase(),
        hourlyRate: parseFloat(hourlyRate),
        category: selectedRole ? selectedRole : 'Member',
      };
      push(userRef, userData)
        .then(() => {
          showAlert('Success', 'User added successfully');
          createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
              const user = userCredential.user;
              const newMember = {
                ...userData,
              };
              setMembers([...members, newMember]);
              navigation.goBack();
            })
            .catch((error) => {
              console.log('Register Error' + error.message)
            });
        })
        .catch((error) => {
          showAlert('Error', 'Error adding user:' + error);
        });

    } catch (error) {
      showAlert('Error creating member. Please try again.');
      console.error('Error creating member:' + error);
    }
  };

  const handleUpdateMember = async () => {
    if (!firstName || !lastName || !email || !hourlyRate) {
      showAlert('Error', 'All fields are required.');
      return;
    }

    const lowerCaseEmail = memberToEdit.email.toLowerCase();

    try {
      const usersRef = ref(database, 'users');
      const userQuery = query(usersRef, orderByChild('email'), equalTo(email));

      get(userQuery)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const editMember = snapshot.val();
            const userId = Object.keys(editMember)[0];

            const updatedUserData = {
              firstName: firstName,
              lastName: lastName,
              email: lowerCaseEmail,
              hourlyRate: parseFloat(hourlyRate),
              category: selectedRole || 'Member',
            };

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
  const validateEmail = (email) => {
    const emailPattern = /\S+@\S+\.\S+/;
    return emailPattern.test(email);
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back",
      headerTitle: () => (
        <View style={commonStyles.customHeader}>
          <Text style={commonStyles.headerTitle}>{memberToEdit ? 'Edit member' : 'Add member'}</Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          containerStyle={styles.headerContainer}
          leftComponent={
            <Ionicons
              name='ios-arrow-back'
              size={24}
              color='#fff'
              onPress={() => navigation.goBack()}
            />
          }
          centerComponent={{
            text: memberToEdit ? 'Edit member' : 'Add member',
            style: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
          }}
          backgroundColor='#87CEEB'
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

            <Text style={styles.label}>Email</Text>
            <TextField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              editable={memberToEdit ? false : true}
            />
            {!memberToEdit && (
              <Text style={styles.label}>Password</Text>
            )}

            {!memberToEdit && (
              <TextField
                placeholder="Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
            )}

            <Text style={styles.label}>Hourly Rate</Text>
            <TextField
              placeholder="Hourly Rate"
              value={hourlyRate.toString()}
              onChangeText={setHourlyRate}
              keyboardType="numeric"
              style={styles.input}
            />

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Role</Text>
              <RNPickerSelect
                items={[
                  { label: 'Admin', value: 'Admin' },
                  { label: 'Member', value: 'Member' },
                ]}
                value={selectedRole}
                onValueChange={(value) => setSelectedRole(value)}
                style={pickerSelectStyles}
              />
            </View>
            <Button label={memberToEdit ? "Update" : "+ Add"} onPress={memberToEdit ? handleUpdateMember : handleCreateMember} style={styles.button} />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    color: 'black',
    paddingRight: 30,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 20,
    color: 'black',
    paddingRight: 30,
  },
});

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
  label: {
    marginLeft: 5,
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
    backgroundColor: '#5848ff',
    borderRadius: 10,
    alignSelf: 'center',
    width: '50%',
  },
  pickerContainer: {
    marginBottom: 20,
  },
});

export default CreateMemberScreen;
