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
          return <FontAwesome5 name={iconName} size={size} color={color} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#5848ff',
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
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
