import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Card, Button } from 'react-native-elements';
import { Ionicons } from '@expo/vector-icons';

const TaskDetailScreen = ({ route, navigation }) => {
  const { taskObj } = route.params;
  const [task, setTask] = useState(null);

  useEffect(() => {
    if (taskObj) {
      setTask(taskObj);
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
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
  };

  // An icon wrapper for convenience
  const IconRow = ({ name, size, color, text }) => (
    <View style={styles.detailRow}>
      <Ionicons name={name} size={size} color={color} />
      <Text style={styles.detailText}>{text}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {task && (
        <Card containerStyle={styles.card}>
          <Card.Title style={styles.cardTitle}>{task.taskName}</Card.Title>
          <Card.Divider />

          <IconRow name="ios-list" size={24} color="#666" text={task.taskDescription} />
          <IconRow name="ios-cash" size={24} color="#666" text={`$${task.taskCost}`} />
          <IconRow name="ios-time" size={24} color="#666" text={`${task.noOfHours} Hours`} />
          <IconRow name="ios-calendar" size={24} color="#666" text={`Start Date: ${formatDate(task.taskStartDate)}`} />
          <IconRow name="ios-calendar" size={24} color="#666" text={`End Date: ${formatDate(task.taskEndDate)}`} />
          <IconRow name="ios-checkmark-circle-outline" size={24} color="#666" text={`Status: ${task.status}`} />
          <IconRow name="ios-person" size={24} color="#666" text={`Member: ${task.member}`} />
          <IconRow name="ios-calendar" size={24} color="#666" text={`Actual End Date: ${formatDate(task.actualEndDate)}`} />
          <IconRow name="ios-business" size={24} color="#666" text={`Project: ${task.projectId}`} />
        </Card>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
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
  // Add other styles as needed
});

export default TaskDetailScreen;
