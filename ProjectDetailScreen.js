import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet } from 'react-native';
import { firebase } from './firebase';

const ProjectDetailScreen = ({ route, navigation }) => {
  const { projectId } = route.params;
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch project details from Firestore
    const projectRef = firebase.firestore().collection('projects').doc(projectId);
    projectRef.get().then((doc) => {
      if (doc.exists) {
        setProject(doc.data());
      }
    });

    // Fetch tasks related to the project
    const tasksRef = firebase.firestore().collection('tasks').where('projectId', '==', projectId);
    tasksRef.get().then((querySnapshot) => {
      const tasksList = [];
      querySnapshot.forEach((doc) => {
        tasksList.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setTasks(tasksList);
    });
  }, []);

  return (
    <View style={styles.container}>
      {project && (
        <View>
          <Text style={styles.header}>Project: {project.projectName}</Text>
          <Text style={styles.header}>Project: {project.description}</Text>
          <Text style={styles.header}>Project: {project.ProjectCost}</Text>
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
