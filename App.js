// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import LoginScreen from './LoginScreen'; // Import your LoginScreen component
// import RegistrationScreen from './RegistrationScreen'; 
// import ProjectListScreen from './ProjectListScreen';
// import AddProjectScreen from './AddProjectScreen';
// import EditProjectScreen from './EditProjectScreen';
// import ProjectDetailScreen from './ProjectDetailScreen';
// import CreateMemberScreen from './CreateMemberScreen';
// import CreateTaskScreen from './CreateTaskScreen';
// import ProfileDetailScreen from './ProfileDetailScreen';

// const Stack = createStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//      <Stack.Navigator initialRouteName="LoginScreen">
//         <Stack.Screen
//           name="LoginScreen"
//           component={LoginScreen}
//           options={{ title: 'Login' }}
//         />
//         <Stack.Screen
//           name="RegistrationScreen"
//           component={RegistrationScreen}
//           options={{ title: 'Registration' }}
//         />
//          <Stack.Screen
//           name="ProjectListScreen"
//           component={ProjectListScreen}
//           options={{ title: 'Project List' }}
//         />
//         <Stack.Screen
//           name="ProjectListScreen"
//           component={ProjectListScreen}
//           options={{ title: 'Project List' }}
//         />
//         <Stack.Screen
//           name="AddProject"
//           component={AddProjectScreen}
//           options={{ title: 'Add Project' }}
//         />
//          <Stack.Screen
//           name="EditProject"
//           component={EditProjectScreen}
//           options={{ title: 'Edit Project' }}
//         />
//         <Stack.Screen
//           name="ProjectDetails"
//           component={ProjectDetailScreen}
//           options={{ title: 'Project Details' }}
//         />
//         <Stack.Screen
//           name="CreateMember"
//           component={CreateMemberScreen}
//           options={{ title: 'Create Member' }}
//         />
//         <Stack.Screen
//           name="CreateTask"
//           component={CreateTaskScreen}
//           options={{ title: 'Create Task' }}
//         />
//         <Stack.Screen
//           name="ProfileDetail"
//           component={ProfileDetailScreen}
//           options={{ title: 'Profile' }}
//         />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }


import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import AdminTabNavigator from './AdminTabNavigator'; // Create a separate component for your tab bar navigation
import RegistrationScreen from './RegistrationScreen';
import AddProjectScreen from './AddProjectScreen';
import MemberTabNavigator from './MemberTabNavigator';
import CreateMemberScreen from './CreateMemberScreen';
import CreateTaskScreen from './CreateTaskScreen';
import EditProjectScreen from './EditProjectScreen';
import ProfileDetailScreen from './ProfileDetailScreen';
import ProjectDetailScreen from './ProjectDetailScreen';
import ProjectListScreen from './ProjectListScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminTabNavigator" component={AdminTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MemberTabNavigator" component={MemberTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: true }} />
        <Stack.Screen name="AddProject" component={AddProjectScreen} options={{ headerShown: true }} />

        <Stack.Screen name="CreateMembe" component={CreateMemberScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EditProject" component={EditProjectScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

