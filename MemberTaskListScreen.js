import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { FontAwesome } from '@expo/vector-icons';
import { Card } from 'react-native-elements';

const MemberTaskListScreen = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const taskList = [];
    const currentUser = auth.currentUser;
    const currentUserEmail = currentUser.email;
    console.log('currentUser ' + currentUserEmail)
    const userQuery = query(ref(database, 'tasks'), orderByChild('member'), equalTo(currentUserEmail));
    console.log('userQuery' + userQuery)
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        // The snapshot contains the user data matching the email
        const tasks = snapshot.val();

        Object.keys(tasks).forEach((taskId) => {
          const task = tasks[taskId];
          console.log('Task item', task);
          taskList.push(task);
        });
        console.log('TaskList ' + taskList.length)
        setTasks(taskList);
      } else {
        setTasks(taskList);
      }
    }).catch((error) => {
      setTasks(taskList);
      showAlert('Error', 'Error finding Tasks :', error.message);
      return null;
    });
  }, []);

  useEffect(() => {
    filterTasks();
  }, [searchQuery, tasks]);

  const showAlert = (title, message) => {
    Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
  };
  const handleViewDetails = (task) => {
    navigation.navigate('Task Detail', { taskObj: task });
  };

  const filterTasks = () => {
    const query = searchQuery.toLowerCase();

    // Filter tasks based on the query
    const filtered = tasks.filter((task) => {
      return task.taskName.toLowerCase().includes(query) || task.taskDescription.toLowerCase().includes(query);
    });

    setFilteredTasks(filtered);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchInput}>
        <FontAwesome name="search" size={20} color="gray" style={styles.searchIcon} />
        <TextInput
          placeholder="Search tasks..."
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
        data={searchQuery ? filteredTasks : tasks}
        keyExtractor={(item) => item.id?.toString() ?? ''}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (item.status === 'Complete') {
                handleViewDetails(item);
              } else {
                navigation.navigate('Complete Task', { taskObj: item, tasks, setTasks });
              }
            }}
            style={styles.cardTouchable}
          >
            <Card containerStyle={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.taskName}>{item.taskName}</Text>
                <View style={[styles.statusBadge, styles[`status_${item.status.toLowerCase()}`]]}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
              <Card.Divider />
              <Text style={styles.taskDescription}>{item.taskDescription}</Text>
              <Text>{`Start Date: ${formatDate(item.taskStartDate)}`}</Text>
              <Text>{`End Date: ${formatDate(item.taskEndDate)}`}</Text>
              <Text>{`Actual End Date: ${item.actualEndDate ? formatDate(item.actualEndDate) : 'N/A'}`}</Text>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  taskName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  container: {
    paddingBottom: 70,
    flex: 1,
    backgroundColor: '#EFEFF4',
  },
  taskDescription: {
    fontSize: 14,
    color: '#4F4F4F',
    marginBottom: 10,
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
  clearSearchButton: {
    position: 'absolute',
    right: 10,
    padding: 10,
  },
});

export default MemberTaskListScreen;
