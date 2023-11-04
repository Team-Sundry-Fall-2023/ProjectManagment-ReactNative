import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProjectListScreen from './ProjectListScreen';
import CreateMemberScreen from './CreateMemberScreen';
import ProfileDetailScreen from './ProfileDetailScreen';
import TaskListScreen from './TaskListScreen';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
      <Tab.Screen name="ProjectList" component={ProjectListScreen} options={{ title: 'Projects' }} />
      <Tab.Screen name="CreateMember" component={CreateMemberScreen} options={{ title: 'Create Member' }} />
      <Tab.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
