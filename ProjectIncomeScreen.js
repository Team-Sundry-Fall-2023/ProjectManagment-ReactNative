import React, { useState , useEffect} from 'react';
import { View, StyleSheet } from 'react-native';
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
  //  const [project, setProject] = useState(null);

   useEffect(() => {
    if (tasksObj) {
      setTasks(tasksObj);
      console.log(tasks);
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
      // return (
      //   taskDate.isSame(selectedMoment, 'day') ||
      //   (selectedMoment.isSame(taskDate, 'week') && taskDate.isSame(selectedMoment, 'year')) ||
      //   (selectedMoment.isSame(taskDate, 'month') && taskDate.isSame(selectedMoment, 'year')) ||
      //   taskDate.isSame(selectedMoment, 'year')
      // );
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

      // Render function for the Date Picker
      const renderEndDatePicker = (date, setDate, showDatePicker, setShowDatePicker) => (
        <>
            <Button
                label={selectedDate.toDateString()}
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
                <Text style={styles.label}>Date</Text>
                {renderEndDatePicker(selectedDate, setSelectedDate, showDatePicker, setShowDatePicker, "Date")}
            </View>

      <Text>Filtered Costs:</Text>

      {filteredTasks.length === 0 ? (
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

export default ProjectIncomeScreen;
