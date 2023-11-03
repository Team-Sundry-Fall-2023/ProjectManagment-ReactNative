import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, push, set } from "firebase/database";

const CreateTaskScreen = ({ navigation, route }) => {
  const { projectId } = route.params;
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartDate, setTaskStartDate] = useState('');
  const [taskEndDate, setTaskEndDate] = useState('');
  const [taskCost, setTaskCost] = useState(0); // Set taskCost initially to 0
  const [error, setError] = useState(''); // Add a state for error messages

  const handleCreateTask = async () => {
    // Reset the error message
    setError('');

    // Validate input fields
    if (!taskName || !taskDescription || !taskStartDate || !taskEndDate) {
      showAlert('Error','All fields are required.'); // Show an alert
      return;
    }

    try {
      const taskRef = push(ref(database, "tasks"));
      const taskId = taskRef.key;

      const task = {
        taskName:taskName,
        taskDescription:taskDescription,
        taskStartDate:taskStartDate,
        taskEndDate:taskEndDate, // Include taskEndDate
        taskCost:taskCost, // Include taskCost
        projectId: projectId, // Foreign key linking to the project
        taskCode: 0, // Set taskCode to 0 initially
        actualTaskEndDate: null, // Set actualTaskEndDate to null initially
        taskId : taskId,
        status:'New'
      };

      set(taskRef, task)
      .then(() => {
        showAlert('Success','Task added successfully');
        navigation.goBack();
      })
      .catch((error) => {
        showAlert('Error','Error adding task:', error);
      });

    } catch (error) {
      showAlert('Error','Error creating task. Please try again.'); // Show an alert
      console.error('Error creating task:', error);
    }
  };

  // Function to show an alert with the error message
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  return (
    <View style={styles.container}>
      {/* Error message */}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Description"
        value={taskDescription}
        onChangeText={setTaskDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Task Start Date"
        value={taskStartDate}
        onChangeText={setTaskStartDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Task End Date"
        value={taskEndDate}
        onChangeText={setTaskEndDate}
      />
      <Button title="Create Task" onPress={handleCreateTask} />
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
  error: {
    color: 'red',
    marginBottom: 10,
  },
});

export default CreateTaskScreen;
