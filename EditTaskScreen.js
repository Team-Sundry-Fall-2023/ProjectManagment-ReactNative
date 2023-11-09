import React, { useState, useEffect } from 'react';
import { View, Alert, ScrollView, StyleSheet } from 'react-native';
import { Button, TextField, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database';
import { useNavigation, useRoute } from '@react-navigation/native';
import commonStyles from './style';
import RNPickerSelect from 'react-native-picker-select';

const EditTaskScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { tasks, setTasks, taskObj } = route.params;
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

    useEffect(() => {
        if (taskObj) {
            setTask(taskObj);
            setTasks(tasks);
        }
    }, [taskObj, task, tasks]);

    useEffect(() => {
        if (task) {
            setTaskDescription(task.taskDescription);
            setTaskName(task.taskName)
            const startDateString = task.taskStartDate;
            const startDateObject = new Date(startDateString);
            setTaskStartDate(startDateObject);
            const endDateString = task.taskEndDate;
            const dateObject = new Date(endDateString);
            setTaskEndDate(dateObject);
            setTaskProjectId(task.projectId);
            console.log('taskProjectId 0 :' + taskProjectId);
            console.log('taskMemebr 0 :' + taskMemebr);
            setTaskMember(task.member);
        }

    }, [task]);

    useEffect(() => {
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
                        console.log('setProjectOptions 1', options)
                        console.log('taskProjectId 1 :' + taskObj.projectId);
                        setSelectedProjectOptions(options, taskObj.projectId);
                    }
                })
                .catch((error) => {
                    console.error('Error fetching task:', error);
                });

        }

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
                    console.log('userOptions 1', options)
                    console.log('taskMemebr 1', taskObj.member)
                    setSelectedUserOptions(options, taskObj.member);
                }
            })
            .catch((error) => {
                console.error('Error fetching Users:', error);
            });
    }, [task, taskObj]);

    const setSelectedUserOptions = (userOptions, taskMember) => {
        if (taskMember) {
            console.log('taskMemebr', taskMember)
            console.log('userOptions', userOptions)
            const userMatch = userOptions.find((option) => option.value.email === taskMember);
            console.log('userMatch', userMatch)
            if (userMatch) {
                console.log('userMatch', userMatch)
                setSelectedUser(userMatch.value);
            }
        }
    }

    const setSelectedProjectOptions = (projectOptions, taskProjectId) => {
        console.log('taskProjectId ' + taskProjectId);
        if (taskProjectId) {
            console.log('projectOptions' + projectOptions);
            const projectMatch = projectOptions.find((option) => option.value.projectId === taskProjectId);
            if (projectMatch) {
                console.log('projectMatch' + projectMatch);
                setSelectedProject(projectMatch.value);
            }
        }
    }

    const handleEditTask = async () => {

        if (!taskName || !taskDescription) {
            showAlert('Error', 'Task Name and Task Description are required.');
            return;
        }

        if (taskEndDate < taskStartDate) {
            showAlert('Error', 'End date need to be higher than start date.');
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

        if (task.status == 'Complete') {
            showAlert('Error', ' Task already completed. You cannot edit now');
            navigation.goBack();
        }

        const userQuery = query(ref(database, 'tasks'), orderByChild('taskId'), equalTo(task.taskId));

        // Fetch the task data
        get(userQuery)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const tasks = snapshot.val();
                    const taskId = Object.keys(tasks)[0];


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
                        noOfHours: task.noOfHours,
                        taskId: task.taskId
                    };

                    // Update the task in the database
                    update(ref(database, `tasks/${taskId}`), updatedtaskData)
                        .then(() => {
                            showAlert('Success', 'Task data updated');
                            /* const updatedTask = {
                                ...updatedtaskData,
                            };

                            console.log('updatedTask' + updatedTask);
                            
                            setTask(updatedTask); */
                            updateTask(updatedtaskData);
                            navigation.goBack();
                        })
                        .catch((error) => {
                            console.log('Error updating task data:' + error);
                        });
                } else {
                    console.log('task not found');
                }
            })
            .catch((error) => {
                console.log('Error updating task data:' + error);
            });
    };

    const updateTask = (updatedTask) => {
        console.log('updatedTask ', updatedTask)
        // Find the index of the task to be updated in the tasks array
        const taskIndex = tasks.findIndex((taskU) => taskU.taskId === task.taskId);
        console.log('taskIndex ', taskIndex)
        if (taskIndex !== -1) {
            // Create a copy of the tasks array
            const updatedTasks = [...tasks];

            // Update the task in the copied array
            updatedTasks[taskIndex] = updatedTask;
            setTasks(updatedTasks);
        }
    };

    // Function to show an alert with the error message
    const showAlert = (title, message) => {
        Alert.alert(title, message, [{ text: 'OK' }], { cancelable: false });
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerBackTitle: "Back",
            headerTitle: () => (
                <View style={commonStyles.customHeader}>
                    <Text style={commonStyles.headerTitle}>Edit Task</Text>
                </View>
            ),
        });
    }, [navigation]);

    // Render function for the Date Picker
    const renderDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
        <>
            <Button
                label={taskStartDate.toDateString()}
                onPress={() => setShowStartDatePicker(true)}
                style={styles.dateButton}
                labelStyle={styles.dateLabel}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                        setShowDatePicker(false);
                    }}
                    minimumDate={new Date()}
                />
            )}
        </>
    );

    // Render function for the Date Picker
    const renderEndDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
        <>
            <Button
                label={taskEndDate.toDateString()}
                onPress={() => setShowEndDatePicker(true)}
                style={styles.dateButton}
                labelStyle={styles.dateLabel}
            />
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                        if (selectedDate) {
                            setDate(selectedDate);
                        }
                        setShowDatePicker(false);
                    }}
                    minimumDate={new Date()}
                />
            )}
        </>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.fieldContainer}>
                <TextField
                    placeholder="Enter task name"
                    value={taskName}
                    onChangeText={setTaskName}
                    style={styles.input}
                />
            </View>

            <View style={styles.fieldContainer}>
                <TextField
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChangeText={setTaskDescription}
                    style={[styles.input, styles.multilineInput]}
                    multiline={true}
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Start Date</Text>
                <Text style={styles.dateText}>{taskStartDate.toDateString()}</Text>
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>End Date</Text>
                {renderEndDatePicker(taskEndDate, setTaskEndDate, showEndDatePicker, setShowEndDatePicker, "End Date")}
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Assign to</Text>
                <RNPickerSelect
                    onValueChange={(value) => setSelectedUser(value)}
                    items={userOptions}
                    style={pickerSelectStyles}
                    placeholder={{
                        label: 'Select a member',
                        value: null,
                    }}
                    value={selectedUser}
                />
            </View>

            <View style={styles.fieldContainer}>
                <Text style={styles.label}>Project</Text>
                <RNPickerSelect
                    onValueChange={(value) => setSelectedProject(value)}
                    items={projectOptions}
                    style={pickerSelectStyles}
                    placeholder={{
                        label: 'Select a project',
                        value: null,
                    }}
                    value={selectedProject}
                />
            </View>

            <Button label="Update Task" onPress={handleEditTask} style={styles.saveButton} />
        </ScrollView>
    );
};

const pickerSelectStyles = StyleSheet.create({
    inputIOS: {
        fontSize: 16,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
    inputAndroid: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderWidth: 0.5,
        borderColor: 'purple',
        borderRadius: 20,
        color: 'black',
        paddingRight: 30, // to ensure the text is never behind the icon
    },
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    fieldContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        color: '#333',
        marginBottom: 5,
    },
    input: {
        height: 40,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    multilineInput: {
        paddingTop: 10,
        minHeight: 100,
    },
    dateButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'flex-start',
        height: 40,
    },
    dateLabel: {
        color: 'black',
        fontSize: 16,
        textAlign: 'left',
    },
    dateText: {
        fontSize: 16,
    },
    saveButton: {
        marginTop: 20,
        borderRadius: 20,
        backgroundColor: '#5848ff',
    },
});

export default EditTaskScreen;
