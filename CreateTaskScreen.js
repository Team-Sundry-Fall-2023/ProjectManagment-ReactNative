import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { firebase, auth, database } from './firebase';
import { ref, push, set, query, orderByChild, equalTo, get } from 'firebase/database';
import commonStyles from './style';

const CreateTaskScreen = ({ navigation, route }) => {
  const {tasks, setTasks} = route.params;
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskStartDate, setTaskStartDate] = useState(new Date());
  const [taskEndDate, setTaskEndDate] = useState(new Date());
  const { projectObj } = route.params;
  const [project, setProject] = useState(null);
  const [projectOptions, setProjectOptions] = useState([]);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userOptions, setUserOptions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (projectObj) {
      setProject(projectObj);
      setSelectedProject(projectObj);
    }
  }, [projectObj]);

  useEffect(() => {
    if (!project) {
    // Fetch projects related to the current user and populate projectOptions
    if (auth.currentUser) {
      const currentUserEmail = auth.currentUser.email;
      const userProjectsQuery = query(
        ref(database, 'projects'),
        orderByChild('user'),
        equalTo(currentUserEmail)
      );

      get(userProjectsQuery)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const projects = snapshot.val();
            const options = Object.keys(projects).map((projectId) => ({
              label: projects[projectId].name,
              value: projects[projectId],
            }));
            setProjectOptions(options);
          }
        })
        .catch((error) => {
          console.error('Error fetching projects:', error);
        });
      }

    }

    const userQuery = query(
      ref(database, 'users'),
      orderByChild('category'),
      equalTo('Member')
    );

    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const users = snapshot.val();
          const options = Object.keys(users).map((email) => ({
            label: users[email].email,
            value: users[email],
          }));
          setUserOptions(options);
        }
      })
      .catch((error) => {
        console.error('Error fetching Users:', error);
      });
  }, [project]);

  const handleCreateTask = () => {
    // Validate input fields
    if (!taskName || !taskDescription) {
      showAlert('Error', 'Task Name and Task Description are required.');
      return;
    }

    if (!selectedProject) {
      showAlert('Error', 'Project is required.');
      return;
    }

    if (!selectedUser) {
      showAlert('Error', 'Member is required.');
      return;
    }
    const currentUserEmail = auth.currentUser.email;
    const tasksRef = push(ref(database, "tasks"));
    // console.log('Register ref' + userRef)
    const taskId = tasksRef.key;
    // Create a new task with the selected project and other details
    const newTask = {
      taskName: taskName,
      taskDescription: taskDescription,
      taskStartDate: taskStartDate.toISOString(), // Store as ISO string
      taskEndDate: taskEndDate.toISOString(), // Store as ISO string
      taskCost: 0,
      projectId: selectedProject ? selectedProject.projectId : null,
      status: 'New',
      taskId : taskId,
      owner : currentUserEmail,
      member : selectedUser ? selectedUser.email.toLowerCase() : null,
      actualEndDate : null,
      noOfHours : 0
    };

    set(tasksRef, newTask)
      .then(() => {
        showAlert('Success', 'Task added successfully');

        const newTaskDt = {
          ...newTask, 
        };
        setTasks([...tasks, newTaskDt]);
        navigation.goBack();
      })
      .catch((error) => {
        showAlert('Error', 'Error adding task: ' + error);
      });
  };

  // Function to show an alert with the error message
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
          <Text style={commonStyles.headerTitle}>Create a Task</Text>
        </View>
      ),
    });
  }, [navigation]);


  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={taskName}
        onChangeText={setTaskName}
      />
      <TextInput
        style={[styles.input, { height: 4 * 40 }]} 
        placeholder="Description"
        value={taskDescription}
        onChangeText={setTaskDescription}
        multiline={true}
        numberOfLines={4}
      />
      <Text>Start Date:</Text>
      <Button
        title={taskStartDate.toISOString().split('T')[0]}
        onPress={() => setShowStartDatePicker(true)}
      />
      {showStartDatePicker && (
        <DateTimePicker
          value={taskStartDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setTaskStartDate(selectedDate);
            }
            setShowStartDatePicker(false);
          }}
          minimumDate={new Date()} // Disallow past dates
        />
      )}
      <Text>End Date:</Text>
      <Button
        title={taskEndDate.toISOString().split('T')[0]}
        onPress={() => setShowEndDatePicker(true)}
      />
      {showEndDatePicker && (
        <DateTimePicker
          value={taskEndDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setTaskEndDate(selectedDate);
            }
            setShowEndDatePicker(false);
          }}
          minimumDate={new Date()} // Disallow past dates
        />
      )}

<Text>Assign to:</Text>

  <RNPickerSelect
    items={userOptions}
    onValueChange={(value) => setSelectedUser(value)}
    // Disable the picker if a project is selected
  />

<Text>Project:</Text>
{project ? (
  <Text style={styles.selectedProjectText}>
    {project.name}
  </Text>
) : (
  <RNPickerSelect
    items={projectOptions}
    onValueChange={(value) => setSelectedProject(value)}
    disabled={project ? true : false} // Disable the picker if a project is selected
  />
)}
      <Button title="Save" onPress={handleCreateTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CreateTaskScreen;