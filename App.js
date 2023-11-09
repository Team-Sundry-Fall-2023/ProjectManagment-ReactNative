import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import AdminTabNavigator from './AdminTabNavigator'; 
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
        <Stack.Screen name="Add Project" component={AddProjectScreen} options={{ headerShown: true }} />
        <Stack.Screen name="MemberList" component={MemberListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Create Member" component={CreateMemberScreen} options={{ headerShown: true}} />
        <Stack.Screen name="Create Task" component={CreateTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Edit Project" component={EditProjectScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Project Detail" component={ProjectDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen name="ProjectList" component={ProjectListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TaskList" component={TaskListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Task Detail" component={TaskDetailScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Edit Task" component={EditTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="MemberTaskList" component={MemberTaskListScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Complete Task" component={CompleteTaskScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Edit Profile" component={EditProfileScreen} options={{ headerShown: true }} />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
};

export default App;

