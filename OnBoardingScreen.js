import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';

const data = [
  {
    id: 1,
    title: 'Efficient Project Management',
    description: 'A robust React Native application designed to streamline project management. Users can create projects, assign tasks, and manage team members seamlessly. The intuitive interface ensures effective collaboration and organization.',
    img: 'https://www.laser1tech.com/site/wp-content/uploads/2019/09/Project-management-best-practices.png',
  },
  {
    id: 2,
    title: 'Task Assignment and Tracking',
    description: 'This application goes beyond basic project management by allowing users to assign members to specific tasks. Each member can be associated with a unique hourly rate, and task progress is tracked in real-time, capturing completion dates and worked hours.',
    img: 'https://img.freepik.com/premium-vector/2022-goals-vector-concept-business-people-showing-2022-goals-list-flat-vector_199064-203.jpg?size=626&ext=jpg',
  },
  {
    id: 3,
    title: 'Prerequisite Task Handling',
    description: 'Addressing the complexity of project dependencies, the system supports prerequisite tasks. Certain tasks cannot commence until others are completed. This feature enhances project planning and ensures a logical sequence of task execution',
    img: 'https://cfw.paymoapp.com/wp-content/uploads/2022/11/how-to-lessen-your-mental-workload-with-task-management-hero.png',
  },
  {
    id: 4,
    title: 'Comprehensive Project Completion',
    description: 'Upon the successful completion of all tasks within a project, the application automatically marks the project as complete. It records essential metrics such as the total number of hours worked by team members and the overall cost of the project.',
    img: 'https://cdn-cashy-static-assets.lucidchart.com/marketing/blog/2019Q3/project-closure/project-management-closure-process.png',
  },
];

const OnBoardingScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);

  const handleSwipe = (newIndex) => {
    console.log(data[newIndex]);
    if (newIndex === data.length - 1) {
      navigation.navigate('Login')
    }
      setIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <Swiper
        loop={true}
        showsPagination={true}
        onIndexChanged={handleSwipe}
        dotStyle={styles.paginationDot}
        activeDotStyle={styles.activePaginationDot}
      >
        {data.map((item) => (
          <View key={item.id} style={styles.slide}>
            <Image source={{ uri: item.img }} style={styles.image} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </Swiper>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.skipText}>Skip</Text>
        <Ionicons name="arrow-forward-circle" size={32} color="#2196F3" />
      </TouchableOpacity>
    </View>
  );
};

const windowHeight = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: windowHeight * 0.5,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  description: {
    fontSize: 16,
    marginHorizontal: 20,
    textAlign: 'center',
    color: '#666',
  },
  paginationDot: {
    backgroundColor: '#BDBDBD',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  activePaginationDot: {
    backgroundColor: '#2196F3',
    width: 8,
    height: 8,
    borderRadius: 4,
    margin: 3,
  },
  skipButton: {
    position: 'absolute',
    bottom: 30,
    right: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  skipText: {
    marginRight: 8,
    color: '#333',
  },
});

export default OnBoardingScreen;
