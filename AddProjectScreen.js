import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, push, set } from "firebase/database";
import UserContext from './UserContext';

const AddProjectScreen = ({route}) => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useContext(UserContext);
  const { projects, setProjects } = route.params;

  const handleAddProject = async () => {

    if (!name || !description) {
      showAlert('Error','All fields are required.'); // Show an alert
      return;
    }


    const currentUser = auth.currentUser;
    console.log('Addproject ' +user)
    // const userRef = ref(database,'projects');
    const projectRef = push(ref(database, "projects"));
    // console.log('Register ref' + userRef)
    const projectId = projectRef.key;
    const projectData = {
      name : name,
      description : description,
      projectCost: 0,
      user: currentUser.email,
      projectId : projectId
    };
    set(projectRef, projectData)
    .then(() => {
      showAlert('Success','Project added successfully');
      const newProject = {
        ...projectData, 
      };
      setProjects([...projects, newProject]);
      navigation.goBack();
    })
    .catch((error) => {
      showAlert('Error','Error adding project:'+ error);
    });
  };

  return (
    <View style={styles.container}> 
      <TextInput
      style={styles.input}
        placeholder="Project Name"
        value={name}
        onChangeText={(text) => setName(text)}
      />
      <TextInput
      style={styles.input}
        placeholder="Project Description"
        value={description}
        onChangeText={(text) => setDescription(text)}
      />
      <Button title="Add Project" onPress={handleAddProject} />
    </View>
  );
};

const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
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
export default AddProjectScreen;
