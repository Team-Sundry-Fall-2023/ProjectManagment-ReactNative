import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet,Alert } from 'react-native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const ProjectDetailScreen = ({ route, navigation }) => {
  const { projectObj } = route.params;
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (projectObj) {
      setProject(projectObj);
    }
  }, [projectObj]);

  useEffect(() => {
    // // Fetch project details from Firestore
    // const projectRef = firebase.firestore().collection('projects').doc(projectId);
    // console.log('projectObj :' + projectObj);
    // const projectId = projectObj.projectId;

    // const userQuery = query(ref(database, 'projects'),orderByChild('projectId'),equalTo(projectId) );

    // // projectRef.get().then((doc) => {
    // //   if (doc.exists) {
    // //     setProject(doc.data());
    // //   }
    // // });

    // get(userQuery).then((snapshot) => {
    //   if (snapshot.exists()) {
    //     // The snapshot contains the user data matching the email
    //     const user = snapshot.val();

    //     Object.keys(project).forEach((projectId) => {
    //       const projectData = project[projectId];
    //       setProject(projectData);
    //     });
    //   } else {
     
    //     showAlert('Error','Project Not Found');
    //   }
    // }).catch((error) => {

    //   showAlert('Error','Error finding user:'+ error);
    //   return null;
    // });
    if (project) {

      console.log('project ', project);

    const userQuery = query(ref(database, 'tasks'),orderByChild('projectId'),equalTo(project.projectId) );
    console.log('userQuery' + userQuery )
     get(userQuery).then((snapshot) => {
         if (snapshot.exists()) {
           // The snapshot contains the user data matching the email
           const tasks = snapshot.val();

           Object.keys(tasks).forEach((taskId) => {
            const task = tasks[taskId];
            console.log('task item', task);
            tasksList.push(task);
             
          });
          console.log('taskList ' + tasksList.length )
          setTasks(tasksList);
         } else {
          setTasks(tasksList);
         }
       }).catch((error) => {
        setTasks(tasksList);
        showAlert('Error','Error finding Tasks :', error.message);
         return null;
       });
      }else {
        // Handle the case where projectObj is null
        showAlert('Error', 'Project Not Found');
      }


  }, [project]);

  return (
    <View style={styles.container}>
      {project && (
        <View>
          <Text style={styles.header}>Project Name: {project.name}</Text>
          <Text style={styles.header}>Project Description: {project.description}</Text>
          <Text style={styles.header}>Project Cost: {project.projectCost}</Text>
          <Button
            title="Create Task"
            onPress={() => navigation.navigate('CreateTask', { projectId })}
          />
          {tasks.length > 0 ? (
            <FlatList
              data={tasks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskItem}>
                  <Text style={styles.taskName}>{item.taskName}</Text>
                  <Text style={styles.taskDescription}>{item.taskDescription}</Text>
                  <Text>{`Start Date: ${item.taskStartDate}`}</Text>
                  <Text>{`End Date: ${item.taskEndDate}`}</Text>
                  <Text>{`Status: ${item.status}`}</Text>
                </View>
              )}
            />
          ) : (
            <Text>No tasks found for this project.</Text>
          )}
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

export default ProjectDetailScreen;
