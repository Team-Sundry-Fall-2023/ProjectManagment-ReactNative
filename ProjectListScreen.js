import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get, remove } from "firebase/database";
import { Card, Header } from 'react-native-elements';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProjectListScreen = () => {
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProjects, setFilteredProjects] = useState([]);

  useEffect(() => {
    const projectList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
    const userQuery = query(ref(database, 'projects'), orderByChild('user'), equalTo(currentUserEmail));
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        const projects = snapshot.val();

        Object.keys(projects).forEach((projectId) => {
          const project = projects[projectId];
          projectList.push(project);
          console.log(project);
        });
        setProjects(projectList);
      } else {
        setProjects(projectList);
      }
    }).catch((error) => {
      setProjects(projectList);
      showAlert('Error', 'Error finding Projects :', error.message);
      return null;
    });

  }, []);

  useEffect(() => {
    filterProjects();
  }, [searchQuery, projects]);

  const handleDelete = async (project) => {
    if (project.status == 'Complete') {
      showAlert('Error', 'Project already completed. You cannot delete now');
    } else {
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
            const userQuery = query(ref(database, 'tasks'), orderByChild('projectId'), equalTo(project.projectId));
            get(userQuery)
              .then((snapshot) => {
                if (snapshot.exists()) {

                  snapshot.forEach((taskData) => {
                    const taskId = taskData.key;
                    console.log('taskId ', taskId)
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

                const projectQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(project.projectId));
                get(projectQuery)
                  .then((snapshot) => {
                    if (snapshot.exists()) {

                      snapshot.forEach((projectData) => {
                        const projectId = projectData.key;
                        console.log('projectId ', projectId)
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
                console.error('Error deleting project:' + error);
              });
          },
        },
      ]
    );
    }
  };

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };

  const handleViewDetails = (project) => {
    navigation.navigate('Project Detail', { projectObj: project });
  };

  const handleEditDetails = (project) => {
    if (project.status == 'Complete') {
      showAlert('Error', 'Project already completed. You cannot edit now');
    } else {
    console.log('project list project ', project)
    navigation.navigate('Edit Project', { projectObj: project, projects, setProjects });
    }
  };

  const handleRightButtonPress = () => {
    setProjects(updatedProjects => {
      navigation.navigate('Add Project', { projects: updatedProjects, setProjects });
      return updatedProjects; 
    });
  };

  const swipeoutBtns = (item) => [
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="pencil" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF9500',
      onPress: () => handleEditDetails(item),
    },
    {
      component: (
        <View style={styles.swipeButton}>
          <FontAwesome name="trash" size={25} color="#FFF" />
        </View>
      ),
      backgroundColor: '#FF3B30',
      onPress: () => handleDelete(item),
    },
  ];

  const filterProjects = () => {
    const query = searchQuery.toLowerCase();

    const filtered = projects.filter((project) => {
      return project.name.toLowerCase().includes(query) || project.description.toLowerCase().includes(query);
    });

    setFilteredProjects(filtered);
  };

  return (
    <View style={styles.container}>
      <Header
        containerStyle={styles.headerContainer}
        leftComponent={
          <Ionicons
            name='ios-arrow-back'
            size={24}
            color='#fff'
            onPress={() => navigation.goBack()}
          />
        }
        centerComponent={{ text: 'Projects', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
        rightComponent={
          <Ionicons
            name='ios-add'
            size={24}
            color='#fff'
            onPress={handleRightButtonPress}
          />
        }
        backgroundColor='#87CEEB'
      />
      <View style={styles.searchInput}>
        <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search projects..."
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
              <FontAwesome name="times" size={20} color="gray" />
            </TouchableOpacity>
          )}
      </View>
      <FlatList
        data={searchQuery ? filteredProjects : projects}
        keyExtractor={(item) => item.projectId.toString()}
        renderItem={({ item }) => (
          <Swipeout right={swipeoutBtns(item)} autoClose backgroundColor='transparent'>
            <TouchableOpacity
              onPress={() => handleViewDetails(item)}
              style={styles.cardTouchable}
            >
                  <Card containerStyle={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.projectName}>{item.name}</Text>
                  <View style={[styles.statusBadge, styles[`status_${item.status.toLowerCase()}`]]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
                <Card.Divider />
                <View style={styles.projectDetailsContainer}>
                  <Text style={styles.projectCost}><Ionicons name='ios-cash' size='16' color='blue' /> {`$${item.projectCost}`}</Text>
                  <Text style={styles.projectHours}><Ionicons name='ios-time' size='16' color='blue' /> {`${item.noOfHours} Hours`}</Text>
                </View>
                </Card>
            </TouchableOpacity>
          </Swipeout>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={handleRightButtonPress}>
        <FontAwesome name="plus" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#87CEEB',
    borderBottomWidth: 0, 
  },
  cardTouchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  projectName: {
    alignItems: 'center',
    marginBottom: 10,
    fontSize: 18,
    fontWeight: 'bold',
  },
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  projectDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectCost: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    marginRight: 8,
  },
  projectHours: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
  },
  swipeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    right: 20,
    bottom: 90,
    backgroundColor: '#5848ff',
    borderRadius: 28,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  status_new: {
    backgroundColor: 'yellow',
  },
  status_inprogress: {
    backgroundColor: 'lightblue',
  },
  status_complete: {
    backgroundColor: 'green',
  },
  clearSearchButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
});

export default ProjectListScreen;
