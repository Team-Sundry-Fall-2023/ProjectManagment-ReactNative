import React, { useState, useEffect } from 'react';
import { auth, database } from './firebase';
import { ref, query, orderByChild, equalTo, get } from "firebase/database";
import { useNavigation } from '@react-navigation/native';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

const MemberIncomeScreen = () => {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [memberIncomeData, setMemberIncomeData] = useState([]);
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        const taskList = [];
        const currentUser = auth.currentUser;
        const currentUserEmail = currentUser.email;

        const userQuery = query(ref(database, 'tasks'), orderByChild('member'), equalTo(currentUserEmail));

        get(userQuery)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const tasks = snapshot.val();

                    Object.keys(tasks).forEach((taskId) => {
                        const task = tasks[taskId];
                        taskList.push(task);
                    });

                    setTasks(taskList);
                } else {
                    setTasks(taskList);
                }
            })
            .catch((error) => {
                setTasks(taskList);
                showAlert('Error', 'Error finding Tasks :', error.message);
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

    // Customize bar chart colors
    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(88, 72, 255, ${opacity})`, // Bar color
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label color
        style: {
            borderRadius: 16,
        },
        propsForLabels: {
            fontWeight: 'bold', // Make the label text bold
          },
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
                centerComponent={{ text: 'Project Income', style: { color: '#fff', fontSize: 18, fontWeight: 'bold' } }}
                backgroundColor='#87CEEB'
            />
            <ScrollView style={styles.scrollViewContainer}>
                <View style={styles.dateContainer}>
                    {renderEndDatePicker(selectedDate, setSelectedDate, showDatePicker, setShowDatePicker, "Date")}
                </View>

                <Text style={styles.chartTitle}>Income for {moment(selectedDate).format('MMMM YYYY')}</Text>

                {memberIncomeData.length === 0 ? (
                    <Text style={styles.noDataText}>No data available for the selected date.</Text>
                ) : (
                    <ScrollView horizontal>
                        <View style={styles.chartContainer}>
                            <BarChart
                                data={chartData}
                                width={800}
                                height={500}
                                yAxisLabel="$"
                                chartConfig={chartConfig}
                            />
                        </View>
                    </ScrollView>
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
        padding: 16,
        backgroundColor: '#fff',
      },
      headerContainer: {
        backgroundColor: '#87CEEB',
        borderBottomWidth: 0, 
      },
    header: {
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    dateContainer: {
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
        borderColor: '#87CEEB',
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
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    noDataText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    chartContainer: {
        flexDirection: 'row',
    },
});

export default MemberIncomeScreen;
