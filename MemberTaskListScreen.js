import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert,  StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const MemberTaskListScreen = () => {
  const navigation = useNavigation();
  const [Tasks, setTasks] = useState([]);

  useEffect(() => {
    const TaskList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
console.log('currentUser ' + currentUserEmail )
    const userQuery = query(ref(database, 'tasks'),orderByChild('member'),equalTo(currentUserEmail) );
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
      <TouchableOpacity
        onPress={() => {
          console.log('item edit ' +item)
          if(item.status == 'Complete'){
            handleViewDetails(item);
          }else{
          navigation.navigate('CompleteTask', {taskObj:item });
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
  });

export default MemberTaskListScreen;
