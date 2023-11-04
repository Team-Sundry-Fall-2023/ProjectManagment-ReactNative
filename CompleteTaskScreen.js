import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet,Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";
import DateTimePicker from '@react-native-community/datetimepicker';

const CompleteTaskScreen = ({ route, navigation }) => {
  const { taskObj } = route.params;
  const [task, settask] = useState(null);
  const [hours, setHours] = useState(0);
  const [taskEndDate, setTaskEndDate] = useState(new Date());
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [hourlyRate, setHourlyRate] = useState('');
  useEffect(() => {
    if (taskObj) {
      settask(taskObj);
    }
  }, [taskObj,task]);


  useEffect(() => {
    // Fetch the currently authenticated user's details
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
            Object.keys(user).forEach((userId) => {
              const userData = user[userId];
              if (userData ) {
    
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

  const handleCompleteTask = () => {
    // Validate input fields
    if (!hours) {
      showAlert('Error', 'No of hours are required.');
      return;
    }

    const taskCost = noOfHours * hourlyRate;
    const userQuery = query(ref(database, 'tasks'), orderByChild('taskId'), equalTo(task.taskId));

    // Fetch the task data
    get(userQuery)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tasks = snapshot.val();
                const taskId = Object.keys(tasks)[0]; // Assuming there's only one task with a given ID

                const updatedtaskData = {
                    // taskName: task.taskName,
                    // taskDescription: task.taskDescription,
                    // taskStartDate: task.taskStartDate, // Store as ISO string
                    // taskEndDate: task.taskEndDate , // Store as ISO string
                    // taskCost: taskCost,
                    // projectId: task.projectId ,
                    status: 'Complete',
                    // taskId : task.taskId,
                    // owner : task.owner,
                    // member : task.email,
                    actualEndDate : taskEndDate.toISOString(),
                    noOfHours : hours
                };

                // Update the task in the database
                update(ref(database, `tasks/${taskId}`), updatedtaskData)
                    .then(() => {
                        // task data has been successfully updated
                        showAlert('Success', 'task data updated');
                        navigation.goBack();
                    })
                    .catch((error) => {
                        // Handle the error if the update fails
                        showAlert('Error', 'Error updating task data:' + error);
                    });
            } else {
                console.log('task not found'); // Handle the case where the task is not found
            }
        })
        .catch((error) => {
            // Handle the error if the fetch fails
            showAlert('Error', 'Error finding task:' + error);
        });
  };

  // Function to show an alert with the error message
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  return (
    <View style={styles.container}>
      {task && (
        <View>
          <Text style={styles.header}>Name: {task.taskName}</Text>
          <Text style={styles.header}>Description: {task.taskDescription}</Text>
    
          <Text style={styles.header}>Start Date: {task.taskStartDate}</Text>
          <Text style={styles.header}>End Date: {task.taskEndDate}</Text>
          <Text style={styles.header}>Project : {task.projectId}</Text>   
          <Text style={styles.header}>Hours: {item.noOfHours}</Text> 
          <TextInput
          style={styles.input}
          placeholder="Hours Spend : "
          value={hours}
          onChangeText={(text) => setHours(text)}/> 
    <Text>Actual Task End Date:</Text>
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
        </View>
      )}
       <Button title="Complete Task" onPress={handleCompleteTask} />
    </View>
  );
};

const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 14,
    marginBottom: 20,
  },
  taskItem: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    marginBottom: 10,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default CompleteTaskScreen;
