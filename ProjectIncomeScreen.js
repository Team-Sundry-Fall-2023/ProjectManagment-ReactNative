import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Text } from 'react-native-ui-lib';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { BarChart } from 'react-native-chart-kit';
import commonStyles from './style';
import { Ionicons } from '@expo/vector-icons';
import { Header } from 'react-native-elements';

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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerBackTitle: "Back",
      headerTitle: () => (
        <View style={commonStyles.customHeader}>
          <Text style={commonStyles.headerTitle}>Project Income</Text>
        </View>
      ),
    });
  }, [navigation]);

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
                  {renderEndDatePicker(selectedDate, setSelectedDate, showDatePicker, setShowDatePicker)}
                </View>

                <Text style={styles.chartTitle}>Income for {moment(selectedDate).format('MMMM YYYY')}</Text>

                {filteredTasks.length === 0 ? (
                  <Text style={styles.noDataText}>No data available for the selected date.</Text>
                ) : (
                  <ScrollView horizontal>
                    <View style={styles.chartContainer}>
                      <BarChart
                        data={chartData}
                        width={600}
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
    margin: 20,
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
