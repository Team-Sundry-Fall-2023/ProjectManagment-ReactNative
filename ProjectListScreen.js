import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get} from "firebase/database";

const ProjectListScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
console.log('currentUser ' + currentUserEmail )
    const userQuery = query(ref(database, 'projects'),orderByChild('user'),equalTo(currentUserEmail) );
    console.log('userQuery' + userQuery )
     get(userQuery).then((snapshot) => {
         if (snapshot.exists()) {
           // The snapshot contains the user data matching the email
           const projects = snapshot.val();

           Object.keys(projects).forEach((projectId) => {
            const project = projects[projectId];
            console.log('project item', project);
            projectList.push(project);
            // console.log('projectList ' + projectList.length )
             
          });
          console.log('projectList ' + projectList.length )
          setProjects(projectList);
         } else {
          setProjects(projectList);
         }
       }).catch((error) => {
        setProjects(projectList);
        showAlert('Error','Error finding Projects :', error.message);
         return null;
       });


    // const projectRef = firebase.collection('projects');

    // projectRef.onSnapshot((snapshot) => {
    //   const projectList = [];
    //   snapshot.forEach((doc) => {
    //     const projectData = doc.data();
    //     projectList.push({ id: doc.id, ...projectData });
    //   });
    //   setProjects(projectList);
    // });
  }, []);

  const handleDelete = async (project) => {
    Alert.alert(
      'Confirmation',
      'Are you sure you want to delete this project?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            // First, fetch all tasks related to the project
            const tasksRef = firebase.firestore().collection('tasks').where('projectId', '==', project.id);
            const tasksSnapshot = await tasksRef.get();
  
            // Delete all related tasks
            const deleteTasksPromises = [];
            tasksSnapshot.forEach((taskDoc) => {
              const taskRef = firebase.firestore().collection('tasks').doc(taskDoc.id);
              deleteTasksPromises.push(taskRef.delete());
            });
  
            // Delete the project after all tasks are deleted
            Promise.all(deleteTasksPromises)
              .then(async () => {
                const projectRef = firebase.firestore().collection('projects').doc(project.id);
                try {
                  await projectRef.delete();
                } catch (error) {
                  console.error('Error deleting project:'+ error);
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
  const handleViewDetails = (project) => {
    navigation.navigate('ProjectDetail', { projectObj: project });
  };

  return (
    <View>
 <FlatList
  data={projects}
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
          navigation.navigate('EditProject', {projectObj:item });
        }}
      >
        <View>
          <Text>{item.name}</Text>
          <Text>{item.description}</Text>
          <Text>{item.projectCost}</Text> 
        </View>
      </TouchableOpacity>
    </Swipeout>
  )}
/>

      <Button
        title="Add Project"
        onPress={() => {
          navigation.navigate('AddProject');
        }}
      />
    </View>
  );
};

export default ProjectListScreen;
