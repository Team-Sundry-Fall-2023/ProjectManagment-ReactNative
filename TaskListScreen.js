import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert, StyleSheet } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { Card } from 'react-native-elements';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get, remove } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';


const TaskListScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const taskList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
    console.log('currentUser ' + currentUserEmail)
    const userQuery = query(ref(database, 'tasks'), orderByChild('owner'), equalTo(currentUserEmail));
    console.log('userQuery' + userQuery)
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        // The snapshot contains the user data matching the email
        const tasks = snapshot.val();

        Object.keys(tasks).forEach((taskId) => {
          const task = tasks[taskId];
          console.log('Task item', task);
          taskList.push(task);
          // console.log('TaskList ' + TaskList.length )

        });
        console.log('TaskList ' + taskList.length)
        setTasks(taskList);
      } else {
        setTasks(taskList);
      }
    }).catch((error) => {
      setTasks(taskList);
      showAlert('Error', 'Error finding Tasks :', error.message);
      return null;
    });
  }, []);

  const handleDelete = async (task) => {
    if (task.status == 'Complete') {
      showAlert('Error', 'Task already completed. You cannot delete now');
    } else {

      Alert.alert(
        'Confirmation',
        'Are you sure you want to delete this Task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            onPress: async () => {
              // First, fetch all tasks related to the Task
              const userQuery = query(ref(database, 'tasks'), orderByChild('taskId'), equalTo(task.taskId));

              // Fetch the task data
              console.log('userQuery ', userQuery)
              get(userQuery)
                .then((snapshot) => {
                  if (snapshot.exists()) {
                    const tasks = snapshot.val();
                    const deleteTasksPromises = [];

                    snapshot.forEach((taskData) => {
                      const taskId = taskData.key;
                      console.log('taskId ', taskId)
                      const taskRef = ref(database, `tasks/${taskId}`);
                      // Delete each related task
                      deleteTasksPromises.push(remove(taskRef));
                    });
                    Promise.all(deleteTasksPromises).then(() => {
                      showAlert('Success', 'Task deleted');
                      // Update the state to trigger a re-render
                      setTasks((prevTasks) =>
                        prevTasks.filter((item) => item.taskId !== task.taskId)
                      );
                    });
                  } else {
                    console.log('task not found ')
                    showAlert('Error', 'task not found'); // Handle the case where the task is not found
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

  const handleViewDetails = (task) => {
    navigation.navigate('TaskDetail', { taskObj: task });
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleRightButtonPress = () => {
    navigation.navigate('CreateTask', { projectObj: null, tasks, setTasks });
  };

  // New component for swipeout buttons
  const swipeoutBtns = (item) => [
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="trash" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF3B30',
      onPress: () => handleDelete(item),
    },
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="info-circle" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#007AFF',
      onPress: () => handleViewDetails(item),
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={({ item }) => (
          <Swipeout right={swipeoutBtns(item)} autoClose backgroundColor='transparent'>
            <TouchableOpacity
              onPress={() => handleViewDetails(item)}
              style={styles.cardTouchable}
            >
              <Card>
                <View style={styles.cardHeader}>
                  <Text style={styles.taskName}>{item.taskName}</Text>
                  <View style={[styles.statusBadge, styles[`status_${item.status.toLowerCase()}`]]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Card.Divider />
                <Text style={styles.taskDescription}>{item.taskDescription}</Text>
                <Text>{`Member: ${item.member}`}</Text>
                <Text>{`End Date: ${formatDate(item.taskEndDate)}`}</Text>
              </Card>
            </TouchableOpacity>
          </Swipeout>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={handleRightButtonPress}>
        <FontAwesome name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardTouchable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Add bottom margin to create space between the badge and the underline
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Allows task name to fill the space and push status to the right
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  status_new: {
    backgroundColor: 'lightblue',
  },
  status_inprogress: {
    backgroundColor: 'yellow',
  },
  status_complete: {
    backgroundColor: 'green',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  cardTouchable: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  taskDescription: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 10,
  },
  swipeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 20,
    backgroundColor: '#5848ff',
    borderRadius: 28,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default TaskListScreen;
