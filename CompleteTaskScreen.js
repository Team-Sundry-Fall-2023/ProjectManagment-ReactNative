import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Card, Colors, Spacings, Typography, Button as UIButton, TextField } from 'react-native-ui-lib';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";
import DateTimePicker from '@react-native-community/datetimepicker';

const CompleteTaskScreen = ({ route, navigation }) => {
  const { taskObj } = route.params;
  const { tasks, setTasks } = route.params;
  const [task, settask] = useState(null);
  const [hours, setHours] = useState(0);
  const [taskEndDate, setTaskEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  const [project, setProject] = useState([]);

  useEffect(() => {
    if (taskObj) {
      settask(taskObj);
      setTasks(tasks);
       getProjectFromId(taskObj.projectId);
    }
  }, [taskObj, task, tasks]);

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
            Object.keys(users).forEach((userId) => {
              const userData = users[userId];
              if (userData) {

                setHourlyRate(userData.hourlyRate);
              } else {
                setError('User not fount', userId);
              }
            });

          }
        })
        .catch((error) => {
          console.error('Error fetching Users:', error);
        });
    }
  }, []);

  const getProjectFromId = (projectId) => {
    console.log('task' , task)
    const userQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(projectId));
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        const projects = snapshot.val();
        Object.keys(projects).forEach((projectId) => {
          const project = projects[projectId];
          setProject(project);
        });
      }
    }).catch((error) => {
      showAlert('Error', 'Error finding project :', error.message);
      return null;
    });
  };

  const handleCompleteTask = () => {
    if (!hours) {
      showAlert('Error', 'No of hours are required.');
      return;
    }

    const taskCost = hours * hourlyRate;
    const userQuery = query(ref(database, 'tasks'), orderByChild('taskId'), equalTo(task.taskId));

    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const tasks = snapshot.val();
          const taskId = Object.keys(tasks)[0];

          const updatedtaskData = {
            // taskName: task.taskName,
            // taskDescription: task.taskDescription,
            // taskStartDate: task.taskStartDate, // Store as ISO string
            // taskEndDate: task.taskEndDate , // Store as ISO string
            taskCost: taskCost,
            // projectId: task.projectId ,
            status: 'Complete',
            // taskId : task.taskId,
            // owner : task.owner,
            // member : task.email,
            actualEndDate: taskEndDate.toISOString(),
            noOfHours: hours
          };
          console.log('updatedtaskData ', updatedtaskData);
          update(ref(database, `tasks/${taskId}`), updatedtaskData)
            .then(() => {
              showAlert('Success', 'task data updated');
              updateProjectCost(task.projectId, taskCost);
              console.log('updatedtaskData begin', updatedtaskData);
              updateTask(taskCost);
              navigation.goBack();
            })
            .catch((error) => {
              showAlert('Error', 'Error updating task data:' + error);
            });
        } else {
          console.log('task not found');
        }
      })
      .catch((error) => {
        showAlert('Error', 'Error finding task:' + error);
      });
  };

  const updateTask = (taskCost) => {

    const updatedtaskData = {
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      taskStartDate: task.taskStartDate, // Store as ISO string
      taskEndDate: task.taskEndDate, // Store as ISO string
      taskCost: taskCost,
      projectId: task.projectId,
      status: 'Complete',
      taskId: task.taskId,
      owner: task.owner,
      member: task.email,
      actualEndDate: taskEndDate.toISOString(),
      noOfHours: hours
    };

    console.log('updatedTask ', updatedtaskData)
    const taskIndex = tasks.findIndex((task) => task.taskId === updatedtaskData.taskId,);
    console.log('taskIndex ', taskIndex)
    if (taskIndex !== -1) {
      const updatedTasks = [...tasks];
      console.log('updatedTasks End', updatedTasks)
      updatedTasks[taskIndex] = updatedtaskData;
      setTasks(updatedTasks);
    }
  };

  const updateProjectCost = (projectId, taskCost) => {
    const projectQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(projectId));

    get(projectQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const projects = snapshot.val();
          const projectId = Object.keys(projects)[0];

          const updatedProjectData = {
            projectCost: projects[projectId].projectCost + taskCost, // Update the project cost
          };

          update(ref(database, `projects/${projectId}`), updatedProjectData)
            .then(() => {
              // Project cost has been successfully updated
            })
            .catch((error) => {
              showAlert('Error', 'Error updating project cost: ' + error);
            });
        }
      })
      .catch((error) => {
        showAlert('Error', 'Error finding project: ' + error);
      });
  };

  // Function to show an alert with the error message
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  // Render function for the Date Picker
  const renderDatePicker = () => {
    return (
      <>
        <UIButton
          label={taskEndDate.toDateString()}
          onPress={() => setShowEndDatePicker(true)}
          style={styles.dateButton}
          labelStyle={styles.dateLabel}
        />
        {showEndDatePicker && (
          <DateTimePicker
            value={taskEndDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || taskEndDate;
              setTaskEndDate(currentDate);
              setShowEndDatePicker(false);
              if (selectedDate) {
                setTaskEndDate(selectedDate);
              }
            }}
          />
        )}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        {task && (
          <>
            <Text style={styles.heading}>Complete Task</Text>
            <View style={styles.section}>
              <Text style={styles.label}>Task Name</Text>
              <Text style={styles.body}>{task.taskName}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.body}>{task.taskDescription}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Start Date</Text>
              <Text style={styles.body}>{task.taskStartDate}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>End Date</Text>
              <Text style={styles.body}>{task.taskEndDate}</Text>
            </View>
            <View style={styles.section}>
              <Text style={styles.label}>Project</Text>
              <Text style={styles.body}>{project.name}</Text>
            </View>
            <TextField
              placeholder="Hours Spent"
              keyboardType="numeric"
              onChangeText={(text) => setHours(text)}
              style={styles.input}
            />
            <View style={styles.section}>
              <Text style={styles.label}>Actual Task End Date:</Text>
              {renderDatePicker()}
            </View>
            <UIButton
              backgroundColor={Colors.primary}
              label="Complete Task"
              onPress={handleCompleteTask}
              style={styles.button}
            />
          </>
        )}
      </Card>
    </View>
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
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  card: {
    padding: 10,
    margin: Spacings.page,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  heading: {
    padding: Spacings.s2,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.mainText,
    marginBottom: Spacings.s5,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacings.s4,
  },
  label: {
    ...Typography.subheading,
    color: Colors.mainText,
    marginBottom: Spacings.s1,
  },
  body: {
    ...Typography.body,
    color: Colors.subText,
    backgroundColor: '#f2f2f2',
    padding: Spacings.s2,
    borderRadius: 12,
  },
  input: {
    marginTop: Spacings.input,
    height: 40,
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    marginTop: Spacings.s5,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 20,
    padding: 10,
    justifyContent: 'flex-start',
    height: 40,
  },
  dateLabel: {
    color: 'black',
    fontSize: 16,
    textAlign: 'left',
  },
});

export default CompleteTaskScreen;
