import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';

export default function ActivityOverviewScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [todayData, setTodayData] = useState({
    steps: 0,
    workouts: 0,
    calories: 0,
    water: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  const workoutTypeIcons = {
    cardio: 'bicycle',
    strength: 'barbell',
    flexibility: 'body',
    sports: 'football',
    other: 'fitness',
  };

  const workoutTypeColors = {
    cardio: '#ef4444',
    strength: '#8b5cf6',
    flexibility: '#06b6d4',
    sports: '#22c55e',
    other: '#64748b',
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [user?.uid])
  );

  const loadData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const today = FirestoreService.getTodayDateString();
      const fitnessData = await FirestoreService.getFitnessData(user.uid, today);
      const workouts = await FirestoreService.getWorkouts(user.uid, 5);

      if (fitnessData) {
        setTodayData({
          steps: fitnessData.steps || 0,
          workouts: fitnessData.workouts || 0,
          calories: fitnessData.calories || 0,
          water: fitnessData.water || 0,
        });
      }

      setRecentWorkouts(workouts || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatSteps = (steps) => {
    return steps.toLocaleString();
  };

  const formatDistance = (steps) => {
    const avgStepLength = 0.762;
    const distance = (steps * avgStepLength) / 1000;
    return distance.toFixed(1);
  };

  const formatWater = (water) => {
    return (water / 1000).toFixed(1);
  };

  const calculateActiveTime = () => {
    const totalMinutes = recentWorkouts
      .filter(w => w.date === FirestoreService.getTodayDateString())
      .reduce((sum, w) => sum + (parseInt(w.duration) || 0), 0);
    return totalMinutes;
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const workoutDate = date instanceof Date ? date : new Date(date);
    const diffMs = now - workoutDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return workoutDate.toLocaleDateString();
    }
  };

  const activities = [
    {
      id: '1',
      title: 'Step Counter',
      description: 'Track your daily steps and walking distance',
      icon: 'footsteps',
      color: '#22c55e',
      screen: 'StepCounter',
      value: loading ? 'Loading...' : `${formatSteps(todayData.steps)} steps`,
    },
    {
      id: '2',
      title: 'Workout Log',
      description: 'Log your exercises and training sessions',
      icon: 'fitness',
      color: '#8b5cf6',
      screen: 'WorkoutLog',
      value: loading ? 'Loading...' : `${todayData.workouts} workout${todayData.workouts !== 1 ? 's' : ''} today`,
    },
    {
      id: '3',
      title: 'Calorie Tracker',
      description: 'Monitor calories burned vs your daily goal',
      icon: 'flame',
      color: '#ef4444',
      screen: 'CalorieTracker',
      value: loading ? 'Loading...' : `${todayData.calories} / 500 kcal`,
    },
    {
      id: '4',
      title: 'Water Intake',
      description: 'Track your daily water consumption',
      icon: 'water',
      color: '#06b6d4',
      screen: 'WaterTracker',
      value: loading ? 'Loading...' : `${formatWater(todayData.water)} / 2.0 L`,
    },
  ];

  const handleActivityPress = (screen) => {
    navigation.navigate(screen);
  };

  const activeTime = calculateActiveTime();
  const distance = formatDistance(todayData.steps);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Tracking</Text>
        <Text style={styles.subtitle}>Monitor your fitness activities</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.activitiesContainer}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={styles.activityCard}
              onPress={() => handleActivityPress(activity.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.activityHeader}>
                <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                  <Ionicons 
                    name={activity.icon} 
                    size={28} 
                    color={activity.color} 
                  />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </View>
              <View style={styles.activityValue}>
                <Text style={[styles.valueText, { color: activity.color }]}>
                  {activity.value}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickStats}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loading ? '...' : `${activeTime} min`}
              </Text>
              <Text style={styles.statLabel}>Active Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loading ? '...' : `${distance} km`}
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {loading ? '...' : `${todayData.workouts}`}
              </Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentActivities}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          {loading ? (
            <Text style={styles.emptyText}>Loading...</Text>
          ) : recentWorkouts.length === 0 ? (
            <Text style={styles.emptyText}>No recent activities</Text>
          ) : (
            <View style={styles.activityList}>
              {recentWorkouts.map((workout) => {
                const icon = workoutTypeIcons[workout.type] || 'fitness';
                const color = workoutTypeColors[workout.type] || '#64748b';
                return (
                  <View key={workout.id} style={styles.recentActivityItem}>
                    <View style={[styles.recentActivityIcon, { backgroundColor: `${color}20` }]}>
                      <Ionicons name={icon} size={20} color={color} />
                    </View>
                    <View style={styles.recentActivityContent}>
                      <Text style={styles.recentActivityTitle}>{workout.name}</Text>
                      <Text style={styles.recentActivityTime}>
                        {workout.duration} min • {formatTimeAgo(workout.createdAt)}
                      </Text>
                    </View>
                    {workout.calories > 0 && (
                      <Text style={styles.recentActivityCalories}>
                        {workout.calories} kcal
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  scrollView: {
    flex: 1,
  },
  activitiesContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 16,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  activityDescription: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  activityValue: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickStats: {
    margin: 24,
    marginBottom: 0,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    color: '#0ea5e9',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  recentActivities: {
    margin: 24,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activityList: {
    gap: 16,
  },
  recentActivityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentActivityIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recentActivityContent: {
    flex: 1,
  },
  recentActivityTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('semiBold'),
  },
  recentActivityTime: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  recentActivityCalories: {
    fontSize: 16,
    color: '#ef4444',
    ...getFontStyle('semiBold'),
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    paddingVertical: 20,
    ...getFontStyle('regular'),
  },
});

