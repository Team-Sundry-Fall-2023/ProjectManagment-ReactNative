import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert,  StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const MemberTaskListScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const taskList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
console.log('currentUser ' + currentUserEmail )
    const userQuery = query(ref(database, 'tasks'),orderByChild('member'),equalTo(currentUserEmail) );
    console.log('userQuery' + userQuery )
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
          console.log('TaskList ' + taskList.length )
          setTasks(taskList);
         } else {
          setTasks(taskList);
         }
       }).catch((error) => {
        setTasks(taskList);
        showAlert('Error','Error finding Tasks :', error.message);
         return null;
       });
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, tasks]);
  
  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };
  const handleViewDetails = (task) => {
    navigation.navigate('Task Detail', { taskObj: task });
  };

  const filterTasks = () => {
    const query = searchQuery.toLowerCase();
  
    // Filter tasks based on the query
    const filtered = tasks.filter((task) => {
      return task.taskName.toLowerCase().includes(query) || task.taskDescription.toLowerCase().includes(query);
    });
  
    setFilteredTasks(filtered);
  };

  return (
    <View>
      <TextInput
      style={styles.searchInput}
      placeholder="Search tasks..."
      value={searchQuery}
      onChangeText={(text) => setSearchQuery(text)}/>
 <FlatList
   data={searchQuery ? filteredTasks : tasks}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
      <TouchableOpacity
        onPress={() => {
          console.log('item edit ' +item)
          if(item.status == 'Complete'){
            handleViewDetails(item);
          }else{
          navigation.navigate('Complete Task', {taskObj:item , tasks, setTasks});
          }
        }}
      >
        <View>
        <Text style={styles.taskName}>{item.taskName}</Text>
                <Text style={styles.taskDescription}>{item.taskDescription}</Text>
                <Text>{`Start Date: ${item.taskStartDate}`}</Text>
                <Text>{`End Date: ${item.taskEndDate}`}</Text>
                <Text>{`Status: ${item.status}`}</Text>
                <Text>{`Actual End Date: ${item.actualEndDate}`}</Text>
        </View>
      </TouchableOpacity>
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
    searchInput: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      margin: 10,
      paddingLeft: 10,
      borderRadius: 20,
    },
  });

export default MemberTaskListScreen;
