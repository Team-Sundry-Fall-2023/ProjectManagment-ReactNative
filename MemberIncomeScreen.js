import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { BarChart } from 'react-native-chart-kit';

const MemberIncomeScreen = ({ }) => {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [memberIncomeData, setMemberIncomeData] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const taskList = [];
        const currentUser = auth.currentUser;
        const currentUserEmail = currentUser.email;
        console.log('currentUser ' + currentUserEmail)
        const userQuery = query(ref(database, 'tasks'), orderByChild('member'), equalTo(currentUserEmail));
        console.log('userQuery' + userQuery)
        get(userQuery).then((snapshot) => {
            if (snapshot.exists()) {
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
        // Filter tasks based on the selected date
        const filteredTasks = tasks.filter((task) => {
            const taskDate = moment(task.actualEndDate);
            const selectedMoment = moment(selectedDate);

            return (
                (selectedMoment.isSame(taskDate, 'month') && taskDate.isSame(selectedMoment, 'year'))
            );
            // return (
            //   taskDate.isSame(selectedMoment, 'day') ||
            //   (selectedMoment.isSame(taskDate, 'week') && taskDate.isSame(selectedMoment, 'year')) ||
            //   (selectedMoment.isSame(taskDate, 'month') && taskDate.isSame(selectedMoment, 'year')) ||
            //   taskDate.isSame(selectedMoment, 'year')
            // );
        });

        setMemberIncomeData(filteredTasks);
    }, [selectedDate, tasks]);

    // Extract task names and costs for chart data
    const chartData = {
        labels: memberIncomeData.map((item) => item.taskName),
        datasets: [
            {
                data: memberIncomeData.map((item) => item.taskCost),
            },
        ],
    };


    // Render function for the Date Picker
    const renderEndDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
        <>
            <Button
                label={moment(selectedDate).format('MMMM YYYY')}
                onPress={() => setShowDatePicker(true)}
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
                />
            )}
        </>
    );

    return (

        <View style={styles.container} >

            <View style={styles.fieldContainer}>
                <Text>Member Income</Text>
                <Text style={styles.label}>Date</Text>
                {renderEndDatePicker(selectedDate, setSelectedDate, showDatePicker, setShowDatePicker, "Date")}
            </View>

            <Text>Income for {moment(selectedDate).format('MMMM YYYY')}:</Text>


            {memberIncomeData.length === 0 ? (
                <Text>No data available for the selected date.</Text>
            ) : (
                <ScrollView horizontal>
                    <View style={{ flexDirection: 'row' }}>
                        <BarChart
                            data={chartData}
                            width={800} 
                            height={500}
                            yAxisLabel="$"
                            chartConfig={{
                                backgroundGradientFrom: '#ffffff',
                                backgroundGradientTo: '#ffffff',
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                        />
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

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
});

export default MemberIncomeScreen;

