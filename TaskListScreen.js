import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert,  StyleSheet } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const TaskListScreen = () => {
  const navigation = useNavigation();
  const [Tasks, setTasks] = useState([]);

  useEffect(() => {
    const TaskList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
console.log('currentUser ' + currentUserEmail )
    const userQuery = query(ref(database, 'tasks'),orderByChild('owner'),equalTo(currentUserEmail) );
    console.log('userQuery' + userQuery )
     get(userQuery).then((snapshot) => {
         if (snapshot.exists()) {
           // The snapshot contains the user data matching the email
           const Tasks = snapshot.val();

           Object.keys(Tasks).forEach((TaskId) => {
            const Task = Tasks[TaskId];
            console.log('Task item', Task);
            TaskList.push(Task);
            // console.log('TaskList ' + TaskList.length )
             
          });
          console.log('TaskList ' + TaskList.length )
          setTasks(TaskList);
         } else {
          setTasks(TaskList);
         }
       }).catch((error) => {
        setTasks(TaskList);
        showAlert('Error','Error finding Tasks :', error.message);
         return null;
       });


    // const TaskRef = firebase.collection('Tasks');

    // TaskRef.onSnapshot((snapshot) => {
    //   const TaskList = [];
    //   snapshot.forEach((doc) => {
    //     const TaskData = doc.data();
    //     TaskList.push({ id: doc.id, ...TaskData });
    //   });
    //   setTasks(TaskList);
    // });
  }, []);

  const handleDelete = async (Task) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this Task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            // First, fetch all tasks related to the Task
            const tasksRef = firebase.firestore().collection('tasks').where('TaskId', '==', Task.id);
            const tasksSnapshot = await tasksRef.get();
  
            // Delete all related tasks
            const deleteTasksPromises = [];
            tasksSnapshot.forEach((taskDoc) => {
              const taskRef = firebase.firestore().collection('tasks').doc(taskDoc.id);
              deleteTasksPromises.push(taskRef.delete());
            });
  
            // Delete the Task after all tasks are deleted
            Promise.all(deleteTasksPromises)
              .then(async () => {
                const TaskRef = firebase.firestore().collection('Tasks').doc(Task.id);
                try {
                  await TaskRef.delete();
                } catch (error) {
                  console.error('Error deleting Task:'+ error);
                }
              })
              .catch((error) => {
                console.error('Error deleting tasks:'+ error);
              });
          },
        },
      ]
    );
  };
  
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };
  const handleViewDetails = (Task) => {
    navigation.navigate('TaskDetail', { taskObj: Task });
  };

  return (
    <View>
 <FlatList
  data={Tasks}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <Swipeout
      right={[
        {
          text: 'Delete',
          onPress: () => handleDelete(item),
          type: 'delete',
        },
        {
          text: 'View Details',
          onPress: () => handleViewDetails(item),
          type: 'default',
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => {
          console.log('item edit ' +item)
          navigation.navigate('EditTask', {taskObj:item });
        }}
      >
        <View>
        <Text style={styles.taskName}>{item.taskName}</Text>
                <Text style={styles.taskDescription}>{item.taskDescription}</Text>
                <Text>{`Start Date: ${item.taskStartDate}`}</Text>
                <Text>{`End Date: ${item.taskEndDate}`}</Text>
                <Text>{`Status: ${item.status}`}</Text>
                <Text>{`Member: ${item.member}`}</Text>
                <Text>{`Cost: ${item.taskCost}`}</Text>
                <Text>{`Actual End Date: ${item.actualEndDate}`}</Text>
        </View>
      </TouchableOpacity>
    </Swipeout>
  )}
/>

      <Button
        title="Add Task"
        onPress={() => {
          navigation.navigate('CreateTask');
        }}
      />
    </View>
  );
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

export default TaskListScreen;
