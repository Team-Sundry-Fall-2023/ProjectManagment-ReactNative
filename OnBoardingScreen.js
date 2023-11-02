import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Swiper from 'react-native-swiper';

const data = [
  {
    id: 1,
    description: 'A React Native application that implements an online project management system',
    img: require('./assets/img/1.png'),
  },
  {
    id: 2,
    description: 'Another description here',
    img: require('./assets/img/2.png'),
  },
  {
    id: 3,
    description: 'Yet another description here',
    img: require('./assets/img/3.png'),
  },
  {
    id: 4,
    description: 'And one more description here',
    img: require('./assets/img/4.png'),
  },
];

const OnBoardingScreen = ({ navigation }) => {
  const [index, setIndex] = useState(0);

  const handleSwipe = newIndex => {
    setIndex(newIndex);
  };

  return (
    <View style={styles.container}>
      <Swiper
        loop={true}
        showsPagination={true}
        onIndexChanged={handleSwipe}
      >
        {data.map(item => (
          <View key={item.id} style={styles.slide}>
            <Image source={item.img} style={styles.image} />
            <Text style={styles.description}>{item.description}</Text>
          </View>
        ))}
      </Swiper>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text>Skip</Text>
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
  swiper: {
    flex: 1, 
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: '100%', 
    height: windowHeight * 0.75, 
  },
  description: {
    fontSize: 18,
    margin: 20,
    textAlign: 'center',
  },
  skipButton: {
    position: 'absolute',
    bottom: 30, 
    right: 40, 
    alignSelf: 'center', 
  },
});

export default OnBoardingScreen;
