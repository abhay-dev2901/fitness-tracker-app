import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import ActivityOverviewScreen from '../screens/activity/ActivityOverviewScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import SocialScreen from '../screens/main/SocialScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import StepCounterScreen from '../screens/activity/StepCounterScreen';
import WorkoutLogScreen from '../screens/activity/WorkoutLogScreen';
import CalorieTrackerScreen from '../screens/activity/CalorieTrackerScreen';
import WaterTrackerScreen from '../screens/activity/WaterTrackerScreen';
import AddWorkoutScreen from '../screens/activity/AddWorkoutScreen';
import AddExerciseScreen from '../screens/activity/AddExerciseScreen';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';

const Tab = createBottomTabNavigator();
const ActivityStack = createNativeStackNavigator();

function ActivityNavigator() {
  return (
    <ActivityStack.Navigator 
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        animation: 'slide_from_right',
      }}
    >
      <ActivityStack.Screen name="ActivityOverview" component={ActivityOverviewScreen} />
      <ActivityStack.Screen name="StepCounter" component={StepCounterScreen} />
      <ActivityStack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
      <ActivityStack.Screen name="CalorieTracker" component={CalorieTrackerScreen} />
      <ActivityStack.Screen name="WaterTracker" component={WaterTrackerScreen} />
      <ActivityStack.Screen name="AddWorkout" component={AddWorkoutScreen} />
      <ActivityStack.Screen name="AddExercise" component={AddExerciseScreen} />
    </ActivityStack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Social') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0ea5e9',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Activity" component={ActivityNavigator} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Social" component={SocialScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

