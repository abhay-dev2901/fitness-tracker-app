import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getFontStyle } from '../../utils/fonts';

export default function ActivityOverviewScreen() {
  const navigation = useNavigation();

  const activities = [
    {
      id: '1',
      title: 'Step Counter',
      description: 'Track your daily steps and walking distance',
      icon: 'footsteps',
      color: '#22c55e',
      screen: 'StepCounter',
      value: '8,547 steps',
    },
    {
      id: '2',
      title: 'Workout Log',
      description: 'Log your exercises and training sessions',
      icon: 'fitness',
      color: '#8b5cf6',
      screen: 'WorkoutLog',
      value: '1 workout today',
    },
    {
      id: '3',
      title: 'Calorie Tracker',
      description: 'Monitor calories burned vs your daily goal',
      icon: 'flame',
      color: '#ef4444',
      screen: 'CalorieTracker',
      value: '342 / 500 kcal',
    },
    {
      id: '4',
      title: 'Water Intake',
      description: 'Track your daily water consumption',
      icon: 'water',
      color: '#06b6d4',
      screen: 'WaterTracker',
      value: '1.2 / 2.0 L',
    },
  ];

  const handleActivityPress = (screen) => {
    navigation.navigate(screen);
  };

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
              <Text style={styles.statValue}>45 min</Text>
              <Text style={styles.statLabel}>Active Time</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>2.3 km</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>5 days</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.recentActivities}>
          <Text style={styles.sectionTitle}>Recent Activities</Text>
          <View style={styles.activityList}>
            <View style={styles.recentActivityItem}>
              <View style={styles.recentActivityIcon}>
                <Ionicons name="bicycle" size={20} color="#8b5cf6" />
              </View>
              <View style={styles.recentActivityContent}>
                <Text style={styles.recentActivityTitle}>Morning Cycling</Text>
                <Text style={styles.recentActivityTime}>30 min • 2 hours ago</Text>
              </View>
              <Text style={styles.recentActivityCalories}>185 kcal</Text>
            </View>
            <View style={styles.recentActivityItem}>
              <View style={styles.recentActivityIcon}>
                <Ionicons name="walk" size={20} color="#22c55e" />
              </View>
              <View style={styles.recentActivityContent}>
                <Text style={styles.recentActivityTitle}>Evening Walk</Text>
                <Text style={styles.recentActivityTime}>15 min • Yesterday</Text>
              </View>
              <Text style={styles.recentActivityCalories}>89 kcal</Text>
            </View>
          </View>
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
});

