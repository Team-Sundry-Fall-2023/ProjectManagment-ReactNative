import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';
import ProfileDetailScreen from './ProfileDetailScreen';
import MemberTaskListScreen from './MemberTaskListScreen';
import MemberIncomeScreen from './MemberIncomeScreen';

const Tab = createBottomTabNavigator();

const MemberTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'MemberTaskList') {
            iconName = focused ? 'tasks' : 'tasks';
          } else if (route.name === 'ProfileDetail') {
            iconName = focused ? 'user-circle' : 'user-circle';
          }else if (route.name === 'MemberIncome') {
            iconName = focused ? 'user-circle' : 'user-circle';
          }

          // Return the icon component
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#5848ff', // Use the same color as in TabNavigator
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          bottom: 0,
          padding: 10,
          height: 70,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5,
        },
      })}
    >
      <Tab.Screen
        name="MemberTaskList"
        component={MemberTaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="MemberIncome"
        component={MemberIncomeScreen}
        options={{
          title: 'Income'
        }}
      />
      <Tab.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{
          headerShown: false, // This hides the navigation bar on the top
        }}
      />
    </Tab.Navigator>
  );
};

export default MemberTabNavigator;
