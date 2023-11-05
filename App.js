import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import AdminTabNavigator from './AdminTabNavigator'; // Create a separate component for your tab bar navigation
import RegistrationScreen from './RegistrationScreen';
import AddProjectScreen from './AddProjectScreen';
import MemberTabNavigator from './MemberTabNavigator';
import CreateMemberScreen from './CreateMemberScreen';
import MemberListScreen from './MemberListScreen';
import CreateTaskScreen from './CreateTaskScreen';
import EditProjectScreen from './EditProjectScreen';
import ProfileDetailScreen from './ProfileDetailScreen';
import ProjectDetailScreen from './ProjectDetailScreen';
import ProjectListScreen from './ProjectListScreen';
import OnBoardingScreen from './OnBoardingScreen';
import UserProvider from './UserProvider';

import TaskDetailScreen from './TaskDetailScreen';
import EditTaskScreen from './EditTaskScreen';
import TaskListScreen from './TaskListScreen';
import MemberTaskListScreen from './MemberTaskListScreen';
import CompleteTaskScreen from './CompleteTaskScreen';
import EditProfileScreen from './EditProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <UserProvider>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="OnBoardingScreen">
        <Stack.Screen name="OnBoardingScreen" component={OnBoardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminTabNavigator" component={AdminTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="MemberTabNavigator" component={MemberTabNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Registration" component={RegistrationScreen} options={{ headerShown: true }} />
        <Stack.Screen name="AddProject" component={AddProjectScreen} options={{ headerShown: true }} />

        <Stack.Screen name="MemberList" component={MemberListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CreateMember" component={CreateMemberScreen} options={{ headerShown: true}} />
        <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EditProject" component={EditProjectScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EditTask" component={EditTaskScreen} options={{ headerShown: true }} />

        <Stack.Screen name="MemberTaskList" component={MemberTaskListScreen} options={{ headerShown: false }} />

        <Stack.Screen name="CompleteTask" component={CompleteTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
};

export default App;

