import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TextInput } from 'react-native';
import { Button } from 'react-native-ui-lib';
import { database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import FontAwesome from '@expo/vector-icons/FontAwesome';

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
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
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
        <Text style={styles.taskDetailText}>Start: {formatDate(item.taskStartDate)}</Text>
        <Text style={styles.taskDetailText}>End: {formatDate(item.taskEndDate)}</Text>
        <Text style={styles.taskDetailText}>Status: {item.status}</Text>
        <Text style={styles.taskDetailText}>Member: {item.member}</Text>
        <Text style={styles.taskDetailText}>Actual End: {formatDate(item.actualEndDate)}</Text>
        <Text style={styles.taskDetailText}>Cost: {item.taskCost}</Text>
        <Text style={styles.taskDetailText}>Hours: {`${item.noOfHours} Hours`}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {project && (
        <>
          <View style={styles.projectHeader}>
            <Text style={styles.projectName}>{project.name}</Text>
            <Text style={styles.projectDescription}>{project.description}</Text>
            <Text style={styles.projectCost}>Cost: {project.projectCost}</Text>
            <Text style={styles.projectCost}>Hours: {`${project.noOfHours} Hours`}</Text>
            <Button
              label="Project Income"
              onPress={() => navigation.navigate('Project Income', { tasksObj: tasks})}
              style={styles.createTaskButton}
            />
          {project.status !== 'Complete' && (
            <Button
              label="Create Task"
              onPress={() => navigation.navigate('Create Task', { projectObj: project, tasks, setTasks })}
              style={styles.createTaskButton}
            />
          )}
          </View>
          <View style={styles.searchInput}>
            <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
            <TextInput
              placeholder="Search tasks..."
              value={searchQuery}
              onChangeText={(text) => setSearchQuery(text)} />
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
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  projectHeader: {
    padding: 16,
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
  projectCost: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
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

export default ProjectDetailScreen;
