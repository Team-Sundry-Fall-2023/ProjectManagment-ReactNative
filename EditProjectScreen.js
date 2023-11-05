import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,FlatList} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase, database, auth } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

const EditProjectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectObj } = route.params;
  const [project, setProject] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const { projects, setProjects } = route.params;


  useEffect(() => {
    if (projectObj) {
      setProject(projectObj);
      setProjects(projects);
    }
  }, [projectObj, project,projects]);


  useEffect(() => {
    console.log(project)
    if (project) {
      const tasksList = [];
      setDescription(project.description);
      setName(project.name)
      const userQuery = query(ref(database, 'tasks'), orderByChild('projectId'), equalTo(project.projectId));
      console.log('userQuery' + userQuery)
      get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
          // The snapshot contains the user data matching the email
          const tasks = snapshot.val();

          Object.keys(tasks).forEach((taskId) => {
            const task = tasks[taskId];
            console.log('task item', task);
            tasksList.push(task);

          });
          console.log('taskList Length' + tasksList.length)
          setTasks(tasksList);
        } else {
          setTasks(tasksList);
        }
      }).catch((error) => {
        setTasks(tasksList);
        showAlert('Error', 'Error finding Tasks :', error.message);
        return null;
      });
    } else {

    }

  }, [project]);

  const handleEditProject = async () => {

    if (!name || !description) {
      showAlert('Error','All fields are required.'); // Show an alert
      return;
    }
    
    const userQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(project.projectId));

    // Fetch the project data
    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const projects = snapshot.val();
          const projectId = Object.keys(projects)[0]; // Assuming there's only one project with a given ID


          const updatedProjectData = {
            name: name,
            description: description,
          };

          // Update the project in the database
          update(ref(database, `projects/${projectId}`), updatedProjectData)
            .then(() => {
              // Project data has been successfully updated
              showAlert('Success', 'Project data updated');
              updateProject(updatedProjectData);
              navigation.goBack();
            })
            .catch((error) => {
              // Handle the error if the update fails
              showAlert('Error', 'Error updating project data:' + error);
            });
        } else {
          console.log('Project not found'); // Handle the case where the project is not found
        }
      })
      .catch((error) => {
        // Handle the error if the fetch fails
        showAlert('Error', 'Error finding project:' + error);
      });
  };

  const updateProject = (updatedProject) => {
    console.log( 'updatedProject ',updatedProject)

    const projectIndex = projects.findIndex((projectU) => projectU.projectId === project.projectId);
    console.log( 'projectIndex ',projectIndex)
    if (projectIndex !== -1) {
      // Create a copy of the tasks array
      const updatedProjects = [...projects];

      // Update the task in the copied array
      updatedProjects[projectIndex] = updatedProject;
      console.log( 'updatedProject ',updatedProjects)
      // Set the state to trigger a re-render with the updated tasks
      setProjects(updatedProjects);
    }
  };

  // return (
  //   <View style={styles.container}>
  //     <TextInput
  //      style={styles.input}
  //       placeholder="Project Name"
  //       value={name}
  //       onChangeText={(text) => setName(text)}
  //     />
  //     <TextInput
  //      style={styles.input}
  //       placeholder="Project Description"
  //       value={description}
  //       onChangeText={(text) => setDescription(text)}
  //     />
  //     <Button title="Edit Project" onPress={handleEditProject} />
  //   </View>
  // );



  return (
    <View style={styles.container}>
      {/* {project && ( */}
      <View>
        <TextInput
          style={styles.input}
          placeholder="Project Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Project Description"
          value={description}
          onChangeText={(text) => setDescription(text)}
        />
        <Button title="Edit Project" onPress={handleEditProject} />
        <Button
          title="Create Task"
          onPress={() => navigation.navigate('CreateTask', { projectObj: project,tasks, setTasks })}
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
                <Text>{`Member: ${item.member}`}</Text>
                <Text>{`Cost: ${item.taskCost}`}</Text>
                <Text>{`Hours: ${item.taskCost}`}</Text>
                <Text>{`Actual End Date: ${item.actualEndDate}`}</Text>
              </View>
            )}
          />
        ) : (
          <Text>No tasks found for this project.</Text>
        )}
      </View>
      {/* )} */}
    </View>
  );

};




// Function to show an alert with the error message
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
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
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

export default EditProjectScreen;
