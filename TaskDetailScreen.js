import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, query, orderByChild, equalTo, get, remove } from "firebase/database";
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Header } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskObj } = route.params;
  const [task, setTask] = useState(null);
  const [project, setProject] = useState([]);

  useEffect(() => {
    if (taskObj) {
      setTask(taskObj);
      getProjectFromId(taskObj);
    }
  }, [taskObj]);

  const formatDate = (dateString) => {
    if (!dateString) {
      return 'N/A';
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return 'Invalid date';
    }
    const options = { timeZone: 'America/Toronto', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'};
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };
  

  const getProjectFromId = (task) => {
    const userQuery = query(ref(database, 'projects'), orderByChild('projectId'), equalTo(task.projectId));
    get(userQuery).then((snapshot) => {
      if (snapshot.exists()) {
        const projects = snapshot.val();
        Object.keys(projects).forEach((projectId) => {
          const project = projects[projectId];
          setProject(project);
        });
      }
    }).catch((error) => {
      showAlert('Error', 'Error finding project :', error.message);
      return null;
    });
  };

  // An icon wrapper for convenience
  const IconRow = ({ name, size, color, text }) => (
    <View style={styles.detailRow}>
      <Ionicons name={name} size={size} color={color}  style={styles.icon} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );

  return (
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
        centerComponent={{ text: 'Task Details', style: { color: '#000', fontSize: 18, fontWeight: 'bold' } }}
        backgroundColor='#fff'
      />
      <ScrollView style={styles.scrollViewContainer}>
      {task && (
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>{task.taskName}</Card.Title>
          <Card.Divider />

          <IconRow name="ios-list" size={24} color="#666" text={task.taskDescription} />
          <IconRow name="ios-business" size={24} color="#666" text={`Project: ${project.name}`} />
          <IconRow name="ios-person" size={24} color="#666" text={`Assign to: ${task.member}`} />
          <IconRow name="ios-calendar" size={24} color="#666" text={`Start Date: ${formatDate(task.taskStartDate)}`} />
          <IconRow name="ios-calendar" size={24} color="#666" text={`End Date: ${formatDate(task.taskEndDate)}`} />
          <IconRow name="ios-checkmark-circle-outline" size={24} color="#666" text={`Status: ${task.status}`} />
          <IconRow name="ios-calendar-sharp" size={24} color="#666" text={`Complete Date: ${formatDate(task.actualEndDate)}`} />
          <IconRow name="ios-time" size={24} color="#666" text={`${task.noOfHours} Hours`} />
          <IconRow name="ios-cash" size={24} color="#666" text={`$${task.taskCost}`} />
        </Card>
      )}
    </ScrollView>
    </View>
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
    backgroundColor: '#f2f2f2',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    margin: 16,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.1,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  button: {
    backgroundColor: '#5848ff',
    borderRadius: 30,
    marginTop: 20,
  },
  icon: {
    marginRight: 8,
    color: '#2196F3',
  },
});

export default TaskDetailScreen;
