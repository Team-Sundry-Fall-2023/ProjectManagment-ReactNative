import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNPickerSelect from 'react-native-picker-select';
import { firebase, auth, database } from './firebase';
import { ref, push, set, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { useNavigation, useRoute } from '@react-navigation/native';
import commonStyles from './style';

const EditTaskScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const {tasks, setTasks, taskObj} = route.params;
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
    const [taskProjectId, setTaskProjectId] = useState('');
    const [taskMemebr, setTaskMember] = useState('');

    console.log('taskObj 1' + taskObj);
    useEffect(() => {
        if (taskObj) {
            setTask(taskObj);
        }
    }, [taskObj, task]);

    console.log('task 1' + task);

    useEffect(() => {
        if (task) {
            setTaskDescription(task.taskDescription);
            setTaskName(task.taskName)
            const startDateString = task.taskStartDate; // Replace this with your date string
            const startDateObject = new Date(startDateString);
            setTaskStartDate(startDateObject);
            const endDateString = task.taskEndDate; // Replace this with your date string
            const dateObject = new Date(endDateString);
            setTaskEndDate(dateObject);
            setTaskProjectId(task.projectId);
            setTaskMember(task.member);
        }

    }, [task]);

    console.log('taskProjectId 1' + taskProjectId);

    useEffect(() => {
        console.log('taskProjectId 2' + taskProjectId);
       
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
                        }
                        
                        ));
                        setProjectOptions(options);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching task:', error);
                });

        }
        console.log('projectOptions' + projectOptions);
        
        const userQuery = query(
            ref(database, 'users'),
            orderByChild('category'),
            equalTo('Member')
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
            console.log('taskProjectId 3' + taskProjectId);
            if (taskProjectId) {
                console.log('projectOptions' + projectOptions);
                const projectMatch = projectOptions.find((option) => option.value.projectId === taskProjectId);
                if (projectMatch) {
                  setSelectedProject(projectMatch.value);
                }
              }else{
                //console.error('projectMatch:');
              }


              if (taskMemebr) {
                const userMatch = userOptions.find((option) => option.value.email === taskMemebr);
                if (userMatch) {
                  setSelectedUser(userMatch.value);
                }
            }else{
                //console.error('userMatch:');
              }
              


    }, [task]);

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

          if(task.status == 'Complete'){
            showAlert('Error', 'Task already completed. You cannot edit now');
            navigation.goBack();
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
                        taskStartDate: task.taskStartDate, 
                        taskEndDate: taskEndDate.toISOString(), // Store as ISO string
                        taskCost: task.taskCost,
                        projectId: selectedProject ? selectedProject.projectId : null,
                        status: task.status,
                        owner: task.owner,
                        member: selectedUser ? selectedUser.email.toLowerCase() : null,
                        actualEndDate: task.actualEndDate || '',
                        noOfHours : task.noOfHours
                    };

                    // Update the task in the database
                    update(ref(database, `tasks/${taskId}`), updatedtaskData)
                        .then(() => {
                            // task data has been successfully updated
                            showAlert('Success', 'Task data updated');
                            /* const updatedTask = {
                                ...updatedtaskData,
                            };

                            console.log('updatedTask' + updatedTask);
                            
                            setTask(updatedTask); */
                            navigation.goBack();
                        })
                        .catch((error) => {
                            // Handle the error if the update fails
                            console.log('Error updating task data:' + error);
                        });
                } else {
                    console.log('task not found'); // Handle the case where the task is not found
                }
            })
            .catch((error) => {
                // Handle the error if the fetch fails
                console.log('Error updating task data:' + error);
            });
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerLeft: () => (
            <View style={commonStyles.customHeaderLeft}>
              <Button
                onPress={() => navigation.goBack()}
                title="< Back"
                color="#007BFF"
              />
            </View>
          ),
          headerTitle: () => (
            <View style={commonStyles.customHeader}>
              <Text style={commonStyles.headerTitle}>Edit Task</Text>
            </View>
          ),
        });
      }, [navigation]);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Name"
                value={taskName}
                onChangeText={setTaskName}
            />
            <TextInput
                style={[styles.input, { height: 4 * 40 }]} 
                placeholder="Description"
                value={taskDescription}
                onChangeText={setTaskDescription}
                multiline={true}
                numberOfLines={4}
            />
            <Text>Start Date:</Text>
            <Button
                title={taskStartDate.toISOString().split('T')[0]}
            />
            <Text>End Date:</Text>
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

            <Text>Assign to:</Text>

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
            <Button title="Update" onPress={handleEditTask} />
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
