import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput, TouchableOpacity } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

const ProjectDetailScreen = ({ route, navigation }) => {
  const { projectObj } = route.params;
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);



  useEffect(() => {
    if (projectObj) {
      setProject(projectObj);
    }
  }, [projectObj]);

  useEffect(() => {
    if (project) {

      console.log('project ', project);
      const tasksList = [];
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
          console.log('taskList' + tasksList.length)
          setTasks(tasksList);
        } else {
          setTasks(tasksList);
        }
      }).catch((error) => {
        setTasks(tasksList);
        showAlert('Error', 'Error finding Tasks :', error.message);
        return null;
      });
    }
  }, [project]);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, tasks]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return 'Invalid date';
    }
    const options = {
      timeZone: 'America/Toronto',
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  const filterTasks = () => {
    const query = searchQuery.toLowerCase();

    // Filter tasks based on the query
    const filtered = tasks.filter((task) => {
      return task.taskName.toLowerCase().includes(query) || task.taskDescription.toLowerCase().includes(query) || task.member.toLowerCase().includes(query);
    });

    setFilteredTasks(filtered);
  };

  const renderTaskItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskName}>{item.taskName}</Text>
      <Text style={styles.taskDescription}>{item.taskDescription}</Text>
      <View style={styles.taskDetails}>
        <View style={styles.detailRow}>
          <Ionicons name='ios-person' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Assign to: {item.member}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name='ios-calendar' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Start: {formatDate(item.taskStartDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name='ios-calendar' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>End: {formatDate(item.taskEndDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name='ios-checkmark-circle' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Status: {item.status}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name='ios-calendar-sharp' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Complete Date: {formatDate(item.actualEndDate)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name='ios-cash' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Cost: {item.taskCost}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name='ios-time' size={16} style={styles.icon} />
          <Text style={styles.taskDetailText}>Hours: {`${item.noOfHours} Hours`}</Text>
        </View>
      </View>
    </View>

  );

  return (
    <View style={styles.container}>
      {project && (
        <>
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
            centerComponent={{ text: 'Tasks', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
            rightComponent={
              <View style={{ flexDirection: 'row' }}>
                <Ionicons
                  name='ios-cash'
                  size={24}
                  color='#fff'
                  style={{ marginRight: 15 }}
                  onPress={() => {
                    navigation.navigate('Project Income', { tasksObj: tasks})
                  }}
                />
                <Ionicons
                  name='ios-add'
                  size={24}
                  color='#fff'
                  onPress={() => {
                    navigation.navigate('Create Task', { projectObj: project, tasks, setTasks })
                  }}
                />
              </View>
            }
            backgroundColor='#87CEEB'
          />
          <View style={styles.projectHeader}>
            <View style={styles.projectInfoContainer}>
              <Text style={styles.projectDescription}>{project.description}</Text>
            </View>
            <View style={styles.projectDetailsContainer}>
              <Text style={styles.projectCost}><Ionicons name='ios-cash' size='16' color="blue"/> ${project.projectCost}</Text>
              <Text style={styles.projectHours}><Ionicons name='ios-time' size='16' color="blue"/> {`${project.noOfHours}`}</Text>
            </View>
          </View>
          <View style={styles.searchInput}>
            <FontAwesome name="search" size={20} color="#87CEEB" style={styles.searchIcon} />
            <TextInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)} />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                  <FontAwesome name="times" size={20} color="#87CEEB" />
                </TouchableOpacity>
              )}
          </View>
          {tasks.length > 0 ? (
            <FlatList
              data={searchQuery ? filteredTasks : tasks}
              keyExtractor={(item) => item.taskId.toString()}
              renderItem={renderTaskItem}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noTasksText}>No tasks found for this project.</Text>
          )}
        </>
      )}
    </View>
  );
};

const showAlert = (title, message) => {
  Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  projectHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  projectInfoContainer: {
    marginBottom: 8,
  },
  projectDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectDescription: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  projectCost: {
    flex: 1,
    fontSize: 14,
    color: '#555',
  },
  projectHours: {
    flex: 1,
    fontSize: 14,
    color: '#555',
    textAlign: 'right',
  },
  taskItem: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  taskDescription: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  taskDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
    color: '#2196F3',
  },
  taskDetailText: {
    fontSize: 14,
    color: '#444',
  },
  noTasksText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  searchInput: {
    height: 40,
    borderColor: '#87CEEB',
    borderWidth: 1,
    margin: 10,
    paddingLeft: 10,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    padding: 10,
    color:'#87CEEB'
  },
  clearSearchButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
  headerContainer: {
    backgroundColor: '#87CEEB',
    borderBottomWidth: 0, 
  },
  headerRightButton: {
    marginRight: 16,
    padding: 10,
  },
  headerRightButtonText: {
    fontSize: 16,
    color: 'blue',
  },
  headerLeftButton: {
    marginLeft: 16,
    padding: 10,
  },
  headerLeftButtonText: {
    fontSize: 16,
    color: 'blue',
  },
});

export default ProjectDetailScreen;
