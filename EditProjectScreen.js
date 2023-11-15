import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { useNavigation, useRoute } from '@react-navigation/native';
import { database } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

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
      console.log('useEffect projectObj', projectObj)
      console.log('useEffect project', project)
      setProjects(projects);
    }
  }, [projectObj, project, projects]);

  useEffect(() => {
    if (project) {
      console.log('useEffect project', project)
      setProjects(projects);
    }
  }, [projectObj, project, projects]);

  useEffect(() => {
    console.log('tasks userQuery', project)
    if (project) {
      const tasksList = [];
      setDescription(project.description);
      setName(project.name)
      const userQuery = query(ref(database, 'tasks'), orderByChild('projectId'), equalTo(project.projectId));
      console.log('userQuery' + userQuery)
      get(userQuery).then((snapshot) => {
        if (snapshot.exists()) {
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
      showAlert('Error', 'All fields are required.');
      return;
    }

    const userQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(project.projectId));

    get(userQuery)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const projects = snapshot.val();
          const projectId = Object.keys(projects)[0];

          const updatedProjectData = {
            name: name,
            description: description,
            projectId: project.projectId,
            user: project.user,
            projectCost: project.projectCost,
            noOfHours: project.noOfHours,
            status: project.status,
          };

          update(ref(database, `projects/${projectId}`), updatedProjectData)
            .then(() => {
              showAlert('Success', 'Project data updated');
              updateProject(updatedProjectData);
              navigation.goBack();
            })
            .catch((error) => {
              showAlert('Error', 'Error updating project data:' + error);
            });
        } else {
          console.log('Project not found');
        }
      })
      .catch((error) => {
        showAlert('Error', 'Error finding project:' + error);
      });
  };

  const updateProject = (updatedProject) => {
    console.log('updatedProject ', updatedProject)

    const projectIndex = projects.findIndex((projectU) => projectU.projectId === project.projectId);
    console.log('projectIndex ', projectIndex)
    if (projectIndex !== -1) {
      const updatedProjects = [...projects];

      updatedProjects[projectIndex] = updatedProject;
      console.log('updatedProject ', updatedProjects)
      setProjects(updatedProjects);
    }
  };

  const filterTasks = () => {
    const query = searchQuery.toLowerCase();

    const filtered = tasks.filter((task) => {
      return task.taskName.toLowerCase().includes(query) || task.taskDescription.toLowerCase().includes(query) || task.member.toLowerCase().includes(query);
    });

    setFilteredTasks(filtered);
  };

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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        <Header
          containerStyle={styles.headerContainer}
          leftComponent={
            <Ionicons
              name='ios-arrow-back'
              size={24}
              color='#000'
              onPress={() => navigation.goBack()}
            />
          }
          centerComponent={{ text: 'Update project', style: { color: '#000', fontSize: 18, fontWeight: 'bold' } }}
          backgroundColor='#fff'
        />
        <ScrollView style={styles.scrollViewContainer}>
          <View style={styles.projectHeader}>
            <TextInput
              style={styles.editInput}
              placeholder="Project Name"
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.editInput, styles.multilineInput]}
              placeholder="Project Description"
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
            <Button
              label="Update"
              onPress={handleEditProject}
              style={styles.button}
            />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );

};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  scrollViewContainer: {
    flex: 1,
    padding: 16,
  },
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
    backgroundColor: '#5848ff',
    borderRadius: 20,
    alignSelf: 'center',
    width: '50%',
  },
  projectHeader: {
    padding: 16,
    paddingBottom: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
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
