import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, TextField, Text } from 'react-native-ui-lib'; // Importing required components
import { useNavigation } from '@react-navigation/native';
import { auth, database } from './firebase';
import { ref, push, set } from "firebase/database";
import commonStyles from './style'; // Assuming this is where your common styles are defined

const AddProjectScreen = ({ route }) => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const { projects, setProjects } = route.params;
  console.log(projects);

  useEffect(() => {
    if (projects) {
      console.log('projects ', projects)
      setProjects(projects);
    }
  }, [projects]);

  const handleAddProject = async () => {

    if (!name || !description) {
      showAlert('Error', 'All fields are required.');
      return;
    }
    const currentUser = auth.currentUser;
    const projectRef = push(ref(database, "projects"));
    const projectId = projectRef.key;
    const projectData = {
      name: name,
      description: description,
      projectCost: 0,
      user: currentUser.email,
      projectId: projectId
    };
    set(projectRef, projectData)
      .then(() => {
        showAlert('Success', 'Project added successfully');
        console.log('Project added successfully!!!!');

        setProjects((prevProjects) => [...prevProjects, projectData]);
        navigation.goBack();
      })
      .catch((error) => {
        showAlert('Error', 'Error adding project:' + error);
      });
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back",
      headerTitle: () => (
        <View style={commonStyles.customHeader}>
          <Text style={commonStyles.headerTitle}>Add Project</Text>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.fieldContainer}>
        <TextField
          placeholder="Project Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      </View>
      <View style={styles.fieldContainer}>
        <TextField
          placeholder="Project Description"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multilineInput]}
          multiline={true}
        />
      </View>
      <Button
        label="Add Project"
        onPress={handleAddProject}
        style={styles.button}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  input: {
    height: 40,
    width: '100%', // Set a fixed width for the TextFields
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20, // This is half of the height to make the TextField rounded
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  multilineInput: {
    marginBottom: 30, 
    marginTop: 10,
    paddingTop: 10,
    minHeight: 100, // Set minimum height for the description TextField
  },
  button: {
    backgroundColor: '#5848ff', // Button color as per your design
    borderRadius: 10, // Adjust to match the button border-radius in CreateTaskScreen
    // Add padding, margin, or any other styles if necessary
  },
  // Include other styles from CreateTaskScreen that may apply
});

export default AddProjectScreen;
