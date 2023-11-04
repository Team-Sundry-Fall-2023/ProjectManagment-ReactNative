import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet,Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskObj } = route.params;
  const [task, settask] = useState(null);

  useEffect(() => {
    if (taskObj) {
      settask(taskObj);
    }
  }, [taskObj,task]);


  return (
    <View style={styles.container}>
      {task && (
        <View>
          <Text style={styles.header}>Name: {task.taskName}</Text>
          <Text style={styles.header}>Description: {task.taskDescription}</Text>
          <Text style={styles.header}>Cost: {task.taskCost}</Text>
          <Text style={styles.header}>Hours: {item.noOfHours}</Text>
          <Text style={styles.header}>Start Date: {task.taskStartDate}</Text>
          <Text style={styles.header}>End Date: {task.taskEndDate}</Text>
          <Text style={styles.header}>Status: {task.status}</Text>
          <Text style={styles.header}>Member : {task.member}</Text>
          <Text style={styles.header}>Actual End Date : {task.actualEndDate}</Text>    
          <Text style={styles.header}>Project : {task.projectId}</Text>     
        </View>
      )}
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
    fontSize: 24,
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
});

export default TaskDetailScreen;
