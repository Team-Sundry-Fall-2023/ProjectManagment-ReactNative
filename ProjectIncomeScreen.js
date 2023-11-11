import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { BarChart } from 'react-native-chart-kit';

const ProjectIncomeScreen = ({ route, navigation }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);

    const { tasksObj } = route.params;

    useEffect(() => {
        if (tasksObj) {
            setTasks(tasksObj);
        }
    }, [tasksObj]);

    useEffect(() => {
        // Filter tasks based on the selected date
        const filteredTasks = tasks.filter((task) => {
            const taskDate = moment(task.actualEndDate);
            const selectedMoment = moment(selectedDate);

            return (
                taskDate.isSame(selectedMoment, 'day') ||
                (selectedMoment.isSame(taskDate, 'week') && taskDate.isSame(selectedMoment, 'year'))
            );
        });

        setFilteredTasks(filteredTasks);
    }, [selectedDate, tasks]);

    // Extract task names and costs for chart data
    const chartData = {
        labels: filteredTasks.map((task) => task.taskName),
        datasets: [
            {
                data: filteredTasks.map((task) => task.taskCost),
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
                label={moment(selectedDate).format('MMMM D, YYYY')}
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
            <View style={styles.header}>
                <Text style={styles.headerText}>Project Income</Text>
            </View>

            <View style={styles.dateContainer}>
                <Text style={styles.label}>Select Date</Text>
                {renderEndDatePicker(selectedDate, setSelectedDate, showDatePicker, setShowDatePicker)}
            </View>

            <Text style={styles.chartTitle}>Filtered Costs:</Text>

            {filteredTasks.length === 0 ? (
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
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
        backgroundColor: '#4CAF50',
        borderWidth: 1,
        borderColor: '#4CAF50',
        borderRadius: 20,
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        height: 40,
    },
    dateLabel: {
        color: '#fff',
        fontSize: 16,
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

export default ProjectIncomeScreen;
