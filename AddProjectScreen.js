import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, TextField, Text } from 'react-native-ui-lib';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from './firebase';
import { ref, push, set } from "firebase/database";
import commonStyles from './style';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

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
      status: 'InProgress',
      user: currentUser.email,
      projectId: projectId,
      noOfHours: 0
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
        centerComponent={{ text: 'Add project', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
        backgroundColor='#87CEEB'
      />
      <ScrollView style={styles.scrollViewContainer}>
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
          label="+ Add"
          onPress={handleAddProject}
          style={styles.button}
        />
      </ScrollView>
    </View>
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
  headerContainer: {
    backgroundColor: '#87CEEB',
    borderBottomWidth: 0, 
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
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  multilineInput: {
    marginBottom: 30,
    marginTop: 10,
    paddingTop: 10,
    minHeight: 100,
  },
  button: {
    backgroundColor: '#5848ff',
    borderRadius: 20,
    alignSelf: 'center',
    width: '50%',
  },
});

export default AddProjectScreen;
