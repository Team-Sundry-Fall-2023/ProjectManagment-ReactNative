import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { firebase, auth, database} from './firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, query, orderByChild, equalTo, get, push, update} from "firebase/database";
import RNPickerSelect from 'react-native-picker-select';
import commonStyles from './style';

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
        showAlert('Error','All fields are required.'); 
        return;
      }

      if (!validateEmail(email)) {
        showAlert('Error','Invalid email format.'); 
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
        push(userRef, userData)
        .then(() => {
          showAlert('Success','User added successfully');
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
            console.log('Register Error' +error.message)
          });
        })
        .catch((error) => {
          showAlert('Error','Error adding user:'+ error);
        });
  
      } catch (error) {
        showAlert('Error creating member. Please try again.');
        console.error('Error creating member:'+ error);
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
      headerLeft: () => (
        <View style={commonStyles.customHeaderLeft}>
          <Button
            onPress={() => navigation.goBack()}
            title="< Back"
            color="#007BFF"
          />
        </View>
      ),
      headerTitle: () => (
        <View style={commonStyles.customHeader}>
          <Text style={commonStyles.headerTitle}>{memberToEdit ? 'Edit member' : 'Add member'}</Text>
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
        value={selectedRole} 
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
