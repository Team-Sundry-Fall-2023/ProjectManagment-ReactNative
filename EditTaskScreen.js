import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { firebase, database, auth } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from "firebase/database";

const EditTaskScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { taskObj } = route.params;
    const [task, setTask] = useState(null);
    const [taskName, setTaskName] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskStartDate, setTaskStartDate] = useState(new Date());
    const [taskEndDate, setTaskEndDate] = useState(new Date());
    const [projectOptions, setProjectOptions] = useState([]);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [userOptions, setUserOptions] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);


    useEffect(() => {
        if (taskObj) {
            setTask(taskObj);
        }
    }, [taskObj, task]);


    useEffect(() => {
        console.log(task)
        if (task) {
            setTaskDescription(task.description);
            setTaskName(task.name)
            setTaskStartDate(task.taskStartDate);
            setTaskEndDate(task.taskEndDate);
            setSelectedProject(task.projectId);
            setSelectedUser(task.member);
        }

    }, []);


    useEffect(() => {
        // Fetch projects related to the current user and populate projectOptions
        if (auth.currentUser) {
            const currentUserEmail = auth.currentUser.email;
            const userProjectsQuery = query(
                ref(database, 'projects'),
                orderByChild('user'),
                equalTo(currentUserEmail)
            );

            get(userProjectsQuery)
                .then((snapshot) => {
                    if (snapshot.exists()) {
                        const projects = snapshot.val();
                        const options = Object.keys(projects).map((projectId) => ({
                            label: projects[projectId].name,
                            value: projects[projectId],
                        }));
                        setProjectOptions(options);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching projects:', error);
                });

        }

        const userQuery = query(
            ref(database, 'users'),
            orderByChild('category'),
            equalTo('Memebr')
        );

        get(userQuery)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const users = snapshot.val();
                    const options = Object.keys(users).map((email) => ({
                        label: users[email].email,
                        value: users[email],
                    }));
                    setUserOptions(options);
                }
            })
            .catch((error) => {
                console.error('Error fetching Users:', error);
            });
    }, []);

    const handleEditTask = async () => {

        if (!taskName || !taskDescription) {
            showAlert('Error', 'Task Name and Task Description are required.');
            return;
          }
      
          if (!selectedProject) {
            showAlert('Error', 'Project is required.');
            return;
          }

          if (!selectedUser) {
            showAlert('Error', 'Member is required.');
            return;
          }

        const userQuery = query(ref(database, 'tasks'), orderByChild('taskId'), equalTo(task.taskId));

        // Fetch the task data
        get(userQuery)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const tasks = snapshot.val();
                    const taskId = Object.keys(tasks)[0]; // Assuming there's only one task with a given ID


                    const updatedtaskData = {
                        taskName: taskName,
                        taskDescription: taskDescription,
                        taskStartDate: task.taskStartDate, // Store as ISO string
                        taskEndDate: taskEndDate.toISOString(), // Store as ISO string
                        taskCost: task.taskCost,
                        projectId: selectedProject ? selectedProject.projectId : null,
                        status: task.status,
                        owner: task.owner,
                        member: selectedUser ? selectedUser.email : null,
                        actualEndDate: task.actualEndDate
                    };

                    // Update the task in the database
                    update(ref(database, `tasks/${taskId}`), updatedtaskData)
                        .then(() => {
                            // task data has been successfully updated
                            showAlert('Success', 'task data updated');
                            navigation.goBack();
                        })
                        .catch((error) => {
                            // Handle the error if the update fails
                            showAlert('Error', 'Error updating task data:' + error);
                        });
                } else {
                    console.log('task not found'); // Handle the case where the task is not found
                }
            })
            .catch((error) => {
                // Handle the error if the fetch fails
                showAlert('Error', 'Error finding task:' + error);
            });
    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Task Name"
                value={taskName}
                onChangeText={setTaskName}
            />
            <TextInput
                style={styles.input}
                placeholder="Task Description"
                value={taskDescription}
                onChangeText={setTaskDescription}
            />
            <Text>Task Start Date:</Text>
            <Button
                title={taskStartDate.toISOString().split('T')[0]}
            />
            <Text>Task End Date:</Text>
            <Button
                title={taskEndDate.toISOString().split('T')[0]}
                onPress={() => setShowEndDatePicker(true)}
            />
            {showEndDatePicker && (
                <DateTimePicker
                    value={taskEndDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) {
                            setTaskEndDate(selectedDate);
                        }
                        setShowEndDatePicker(false);
                    }}
                    minimumDate={new Date()} // Disallow past dates
                />
            )}

            <Text>Memebr:</Text>

            <RNPickerSelect
                items={userOptions}
                onValueChange={(value) => setSelectedUser(value)}
            // Disable the picker if a project is selected
            />

            <Text>Project:</Text>

                <RNPickerSelect
                    items={projectOptions}
                    onValueChange={(value) => setSelectedProject(value)}                  
                />
            <Button title="Edit Task" onPress={handleEditTask} />
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

export default EditTaskScreen;
