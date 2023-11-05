// MemberTabNavigator.js
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileDetailScreen from './ProfileDetailScreen';
import MemberTaskListScreen from './MemberTaskListScreen';

// Define the screens for members here

const Tab = createBottomTabNavigator();

// Define the navigation structure
const MemberTabNavigator = () => {
  return (
    <Tab.Navigator>
        <Tab.Screen name="MemberTaskList" component={MemberTaskListScreen} options={{ title: 'Tasks' }} />
        <Tab.Screen name="ProfileDetail" component={ProfileDetailScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

export default MemberTabNavigator;
