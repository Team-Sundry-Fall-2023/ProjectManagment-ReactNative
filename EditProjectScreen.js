import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, FlatList } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase, database, auth } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';

const EditProjectScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectObj } = route.params;
  const [project, setProject] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState([]);
  const { projects, setProjects } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    if (projectObj) {
      setProject(projectObj);
      console.log('useEffect projectObj' , projectObj)
      console.log('useEffect project' , project)
      setProjects(projects);
    }
  }, [projectObj, project,projects]);

  useEffect(() => {
    if (project) {
      console.log('useEffect project' , project)
      setProjects(projects);
    }
  }, [projectObj, project,projects]);

  useEffect(() => {
    console.log('tasks userQuery',project)
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

  useEffect(() => {
    filterTasks();
  }, [searchQuery, tasks]);

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
            projectId : project.projectId,
            user : project.user,
            projectCost : project.projectCost
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

  const filterTasks = () => {
    const query = searchQuery.toLowerCase();

    // Filter tasks based on the query
    const filtered = tasks.filter((task) => {
      return task.taskName.toLowerCase().includes(query) || task.taskDescription.toLowerCase().includes(query) || task.member.toLowerCase().includes(query);
    });

    setFilteredTasks(filtered);
  };

  // Function to show an alert with the error message
const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
};

const formatDate = (dateString) => {
  if (!dateString) {
    return 'N/A';
  }
  const date = new Date(dateString);
  if (isNaN(date)) {
    return 'Invalid date';
  }
  const options = {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
  };
  return new Intl.DateTimeFormat('en-US', options).format(date);
};

const renderTaskItem = ({ item }) => (
  <View style={styles.taskItem}>
    <Text style={styles.taskName}>{item.taskName}</Text>
    <Text style={styles.taskDescription}>{item.taskDescription}</Text>
    <View style={styles.taskDetails}>
      <Text style={styles.taskDetailText}>Start: {formatDate(item.taskStartDate)}</Text>
      <Text style={styles.taskDetailText}>End: {formatDate(item.taskEndDate)}</Text>
      <Text style={styles.taskDetailText}>Status: {item.status}</Text>
      <Text style={styles.taskDetailText}>Member: {item.member}</Text>
      <Text style={styles.taskDetailText}>Actual End: {formatDate(item.actualEndDate)}</Text>
      <Text style={styles.taskDetailText}>Cost: {item.taskCost}</Text>
      <Text style={styles.taskDetailText}>Hours: {item.noOfHours}</Text>
    </View>
  </View>
);

return (
  <View style={styles.container}>
    <View style={styles.projectHeader}>
      <TextInput
        style={styles.editInput}
        placeholder="Project Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.editInput, styles.multilineInput]} // Increase height for multiline input
        placeholder="Project Description"
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />
      <Button
        label="Edit Project"
        onPress={handleEditProject}
        style={styles.button}
      />
      <Button
        label="Create Task"
        onPress={() => navigation.navigate('Create Task', { projectObj: project, tasks, setTasks })}
        style={styles.button}
      />
    </View>
    <View style={styles.searchInput}>
      <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
      <TextInput
        placeholder="Search tasks..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.input}
      />
    </View>
    {tasks.length > 0 ? (
            <FlatList
            data={searchQuery ? filteredTasks : tasks}
              keyExtractor={(item) => item.id?.toString() ?? ''}
              renderItem={renderTaskItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noTasksText}>No tasks found for this project.</Text>
          )}
  </View>
);

};

const styles = StyleSheet.create({
  editInput: {
    height: 40,
    width: '100%', // Set a fixed width for the TextFields
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20, // This is half of the height to make the TextField rounded
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  multilineInput: {
    paddingTop: 10,
    minHeight: 100, // Minimum height for text area
  },
  button: {
    marginTop : 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  projectHeader: {
    padding: 16,
    paddingBottom: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
    backgroundColor: 'white',
  },
  projectName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  projectDescription: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  createTaskButton: {
    marginBottom: 16,
  },
  taskItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2, // for Android shadow
    shadowOpacity: 0.1, // for iOS shadow
    shadowRadius: 4,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
  },
  taskDetails: {
    marginTop: 8,
  },
  taskDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  searchInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 10,
    paddingLeft: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    padding: 10,
  },
});

export default EditProjectScreen;
