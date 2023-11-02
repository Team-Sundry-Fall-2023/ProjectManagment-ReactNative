// MemberTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileDetailScreen from './ProfileDetailScreen';
import TaskListScreen from './TaskListScreen';

// Define the screens for members here

const MemberTab = createBottomTabNavigator();

// Define the navigation structure
const MemberTabNavigator = () => {
  return (
    <MemberTab.Navigator>
        <Tab.Screen name="TaskList" component={TaskListScreen} options={{ title: 'Tasks' }} />
        <Tab.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Profile' }} />
    </MemberTab.Navigator>
  );
};

export default MemberTabNavigator;
