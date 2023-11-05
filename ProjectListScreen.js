import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase ,auth, database} from './firebase';
import {  ref, query, orderByChild, equalTo, get , remove} from "firebase/database";

const ProjectListScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  // const [updatedProjects, setUpdatedProjects] = useState([]);

  useEffect(() => {
    const projectList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
    const userQuery = query(ref(database, 'projects'),orderByChild('user'),equalTo(currentUserEmail) );
     get(userQuery).then((snapshot) => {
         if (snapshot.exists()) {
           const projects = snapshot.val();

           Object.keys(projects).forEach((projectId) => {
            const project = projects[projectId];
            projectList.push(project);
             
          });
          setProjects(projectList);
         } else {
          setProjects(projectList);
         }
       }).catch((error) => {
        setProjects(projectList);
        showAlert('Error','Error finding Projects :', error.message);
        return null;
       });

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
            const deleteProjectssPromises = [];
            const deleteTasksPromises = [];
            const userQuery = query(ref(database, 'tasks'),orderByChild('projectId'),equalTo(project.projectId) );
                   get(userQuery)
                   .then((snapshot) => {
                       if (snapshot.exists()) {
           
                       snapshot.forEach((taskData) => {
                           const taskId = taskData.key;
                           console.log('taskId ' , taskId)
                           const taskRef = ref(database, `tasks/${taskId}`);
                           deleteTasksPromises.push(remove(taskRef));
                         });          
                       } else {
                           console.log('task not found ')
                       }
                   })
                   .catch((error) => {
                       console.log('Error finding task:' + error)
                   });

            Promise.all(deleteTasksPromises)
              .then(async () => {
            
                const projectQuery = query(ref(database, 'projects'),orderByChild('projectId'),equalTo(project.projectId) );
                get(projectQuery)
                .then((snapshot) => {
                    if (snapshot.exists()) {
        
                    snapshot.forEach((projectData) => {
                        const projectId = projectData.key;
                        console.log('projectId ' , projectId)
                        const taskRef = ref(database, `projects/${projectId}`);
                        deleteProjectssPromises.push(remove(taskRef));
                      });  
                      Promise.all(deleteProjectssPromises).then(() => {
                        showAlert('Success', 'Project deleted');
                        setProjects((prevProjects) =>
                        prevProjects.filter((item) => item.projectId !== project.projectId)
                        );
                    });        
                    } else {
                        console.log('Project not found ')
                    }
                })
                .catch((error) => {
                    console.log('Error finding project:' + error)
                });

              })
              .catch((error) => {
                console.error('Error deleting project:'+ error);
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

  // const refreshProjectsList = () => {
  //   console.log('go back: ' + updatedProjects);
  //   setProjects(updatedProjects);
  // };

  const handleRightButtonPress = () => {
    console.log('create projects' + projects)
    navigation.navigate('AddProject', { projects, setProjects});
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
          console.log('item edit' + item)
          console.log('item edit projects ' + projects)
          navigation.navigate('EditProject', { projectObj: item , projects, setProjects });
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
    </View>
  );
};

export default ProjectListScreen;
