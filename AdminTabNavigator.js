import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome5 } from '@expo/vector-icons';

import ProjectListScreen from './ProjectListScreen';
import MemberListScreen from './MemberListScreen';
import ProfileDetailScreen from './ProfileDetailScreen';
import TaskListScreen from './TaskListScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'TaskList') {
            iconName = focused ? 'tasks' : 'tasks';
          } else if (route.name === 'ProjectList') {
            iconName = focused ? 'project-diagram' : 'project-diagram';
          } else if (route.name === 'MemberList') {
            iconName = focused ? 'users' : 'users';
          } else if (route.name === 'ProfileDetail') {
            iconName = focused ? 'user-circle' : 'user-circle';
          }

          // You can return any component that you like here!
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#5848ff', // Your desired active tint color
        tabBarInactiveTintColor: 'gray', // Set to true if you want to show labels
        tabBarStyle: {
          backgroundColor: '#ffffff', // Tab bar background color
          borderTopLeftRadius: 20, // Adjust these radii to round the corners as you like
          borderTopRightRadius: 20,
          position: 'absolute', // This line can make the tab bar "floating" if needed
          bottom: 0,
          padding: 10, // Add padding to raise the icons a bit above the bottom edge
          height: 70, // You may want to adjust the height to fit your design
          shadowColor: '#000', // These four lines add a drop shadow for elevation effect
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 5, // for Android shadow
        },
      })}
    >
      <Tab.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen
        name="ProjectList"
        component={ProjectListScreen}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen
        name="MemberList"
        component={MemberListScreen}
        options={{ title: 'Members' }}
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

export default TabNavigator;
