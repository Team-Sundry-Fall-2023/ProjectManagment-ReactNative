import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, TextField, Picker, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import { firebase, auth, database } from './firebase';
import { ref, push, set, query, orderByChild, equalTo, get } from 'firebase/database';
import commonStyles from './style';
import RNPickerSelect from 'react-native-picker-select';

const CreateTaskScreen = ({ navigation, route }) => {
  const { tasks, setTasks } = route.params;
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
      setTasks(tasks)
    }
  }, [projectObj, tasks]);

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

    if (taskEndDate < taskStartDate) {
      showAlert('Error', 'End date need to be higher than start date.');
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
      status: 'InProgress',
      taskId: taskId,
      owner: currentUserEmail,
      member: selectedUser ? selectedUser.email.toLowerCase() : null,
      actualEndDate: null,
      noOfHours: 0
    };

    set(tasksRef, newTask)
      .then(() => {
        showAlert('Success', 'Task added successfully');

        setTasks((prevTasks) => [...prevTasks, newTask]);
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
      headerBackTitle: "Back",
      headerTitle: () => (
        <View style={commonStyles.customHeader}>
          <Text style={commonStyles.headerTitle}>Create a Task</Text>
        </View>
      ),
    });
  }, [navigation]);

  // Render function for the Date Picker
  const renderDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
    <>
      <Button
        label={taskStartDate.toDateString()}
        onPress={() => setShowStartDatePicker(true)}
        style={styles.dateButton}
        labelStyle={styles.dateLabel} // Apply the custom label style here
      />
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            if (selectedDate) {
              setDate(selectedDate);
            }
            setShowDatePicker(false);
          }}
          minimumDate={new Date()}
        />
      )}
    </>
  );

    // Render function for the Date Picker
    const renderEndDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
      <>
        <Button
          label={taskEndDate.toDateString()}
          onPress={() => setShowEndDatePicker(true)}
          style={styles.dateButton}
          labelStyle={styles.dateLabel} // Apply the custom label style here
        />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
              }
              setShowDatePicker(false);
            }}
            minimumDate={new Date()}
          />
        )}
      </>
    );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.fieldContainer}>
        <TextField
          placeholder="Enter task name"
          value={taskName}
          onChangeText={setTaskName}
          style={styles.input}
        />
      </View>

      <View style={styles.fieldContainer}>
        <TextField
          placeholder="Enter task description"
          value={taskDescription}
          onChangeText={setTaskDescription}
          style={[styles.input, styles.multilineInput]}
          multiline={true}
        />
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Start Date</Text>
        {renderDatePicker(taskStartDate, setTaskStartDate, showStartDatePicker, setShowStartDatePicker)}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>End Date</Text>
        {renderEndDatePicker(taskEndDate, setTaskEndDate, showEndDatePicker, setShowEndDatePicker)}
      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Assign to</Text>
        <RNPickerSelect
          onValueChange={(value) => setSelectedUser(value)}
          items={userOptions}
          style={pickerSelectStyles}
          placeholder={{
            label: 'Select a member',
            value: null,
          }}
          value={selectedUser}
        />


      </View>

      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Project</Text>
        {project ? (
          <Text style={styles.selectedProjectText}>{project.name}</Text>
        ) : (
          <RNPickerSelect
            onValueChange={(value) => setSelectedProject(value)}
            items={projectOptions}
            style={pickerSelectStyles}
            placeholder={{
              label: 'Select a project',
              value: null,
            }}
            value={selectedProject}
          />
        )}
      </View>

      <Button label="Save Task" onPress={handleCreateTask} style={styles.saveButton} />
    </ScrollView>
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
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    borderRadius: 20,
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

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
    paddingTop: 10,
    minHeight: 100, // Minimum height for text area
  },
  dateButton: {
    backgroundColor: '#fff', // Assuming you want a white background
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'flex-start', // Aligns button content (icon and text) to the left
    height: 40, // Set a fixed height
  },
  dateLabel: {
    color: 'black', // Sets the font color to black
    fontSize: 16, // Sets the font size
    textAlign: 'left', // Aligns the text to the left
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 20,
    backgroundColor: '#5848ff', // Purple color from your tab bar design
  },
});

export default CreateTaskScreen;