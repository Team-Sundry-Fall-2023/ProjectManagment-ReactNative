import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { firebase } from './firebase';

const ProjectListScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const projectRef = firebase.firestore().collection('projects');

    projectRef.onSnapshot((snapshot) => {
      const projectList = [];
      snapshot.forEach((doc) => {
        const projectData = doc.data();
        projectList.push({ id: doc.id, ...projectData });
      });
      setProjects(projectList);
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
                  console.error('Error deleting project:', error);
                }
              })
              .catch((error) => {
                console.error('Error deleting tasks:', error);
              });
          },
        },
      ]
    );
  };
  

  const handleViewDetails = (project) => {
    navigation.navigate('ProjectDetail', { project });
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
                type: 'default', // A default swipe action
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('EditProject', { project: item });
              }}
            >
              <View>
                <Text>{item.name}</Text>
                <Text>{item.description}</Text>
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
