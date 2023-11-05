import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert,  StyleSheet } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database, firestore} from './firebase';
import {  ref, query, orderByChild, equalTo, get, remove} from "firebase/database";

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
  }, []);

  const handleDelete = async (Task) => {
    if(Task.status == 'Complete'){
        showAlert('Error', 'Task already completed. You cannot delete now');
    }else{

    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this Task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            // First, fetch all tasks related to the Task
            const userQuery = query(ref(database, 'tasks'),orderByChild('taskId'),equalTo(Task.taskId) );

                    // Fetch the task data
        console.log('userQuery ', userQuery)
        get(userQuery)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const tasks = snapshot.val();
                const deleteTasksPromises = [];

            snapshot.forEach((taskData) => {
                const taskId = taskData.key;
                console.log('taskId ' , taskId)
                const taskRef = ref(database, `tasks/${taskId}`);
                // Delete each related task
                deleteTasksPromises.push(remove(taskRef));
              });
              Promise.all(deleteTasksPromises).then(() => {
                showAlert('Success', 'Task deleted');
                // Update the state to trigger a re-render
                setTasks((prevTasks) =>
                  prevTasks.filter((item) => item.taskId !== Task.taskId)
                );
            });
            } else {
                console.log('task not found ')
                showAlert('Error','task not found'); // Handle the case where the task is not found
            }
        })
        .catch((error) => {
            // Handle the error if the fetch fails
            console.log('Error finding task:' + error)
            showAlert('Error', 'Error finding task:' + error);
        });
          },
        },
      ]
    );
    }
  };
  
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };
  const handleViewDetails = (Task) => {
    navigation.navigate('TaskDetail', { taskObj: Task });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRightButtonPress = () => {
    navigation.navigate('CreateTask', { projectObj: null, Tasks, setTasks });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={handleRightButtonPress}
          title="Add"
          color="#007BFF" 
        />
      ),
    });
  }, [navigation]);

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
          onPress: () =>
           handleDelete(item),
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
          if(item.status == 'Complete'){
            handleViewDetails(item)
          }else{
            navigation.navigate('EditTask', {taskObj:item, Tasks, setTasks });
          }
        }}
      >
        <View>
        <Text style={styles.taskName}>{item.taskName}</Text>
                <Text style={styles.taskDescription}>{item.taskDescription}</Text>
                <Text>{`Start Date: ${formatDate(item.taskStartDate)}`}</Text>
                <Text>{`End Date: ${formatDate(item.taskEndDate)}`}</Text>
                <Text>{`Status: ${item.status}`}</Text>
                <Text>{`Member: ${item.member}`}</Text>
                <Text>{`Cost: ${item.taskCost}`}</Text>
                <Text>{`Hours: ${item.noOfHours}`}</Text>
                <Text>{`Actual End Date: ${item.actualEndDate ? formatDate(item.actualEndDate) : ''}`}</Text>
        </View>
      </TouchableOpacity>
    </Swipeout>
  )}
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
