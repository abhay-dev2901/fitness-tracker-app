import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getFontStyle } from '../../utils/fonts';
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [todayStats, setTodayStats] = useState({
    steps: 0,
    calories: 0,
    water: 0,
    workouts: 0,
  });
  const [goals] = useState({
    steps: 10000,
    calories: 500,
    water: 2000,
    workouts: 1,
  });
  const [weeklySteps, setWeeklySteps] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [0, 0, 0, 0, 0, 0, 0],
        color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const unsubscribeRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      setupRealTimeUpdates();
      return () => {
        cleanup();
      };
    }, [user?.uid])
  );

  const setupRealTimeUpdates = () => {
    cleanup();
    loadData();
    
    refreshIntervalRef.current = setInterval(() => {
      loadData();
    }, 30000);
  };

  const cleanup = () => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  const loadData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const today = FirestoreService.getTodayDateString();
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = FirestoreService.subscribeToFitnessData(
        user.uid,
        today,
        (data) => {
          if (data) {
            setTodayStats({
              steps: data.steps || 0,
              calories: data.calories || 0,
              water: data.water || 0,
              workouts: data.workouts || 0,
            });
          } else {
            setTodayStats({
              steps: 0,
              calories: 0,
              water: 0,
              workouts: 0,
            });
          }
          setLoading(false);
          setRefreshing(false);
        }
      );

      await loadWeeklyData();
      await loadAchievements();
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadWeeklyData = async () => {
    if (!user?.uid) return;

    try {
      const today = new Date();
      const startDate = new Date();
      startDate.setDate(today.getDate() - 6);

      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = today.toISOString().split('T')[0];

      const weeklyData = await FirestoreService.getFitnessDataRange(
        user.uid,
        startDateString,
        endDateString
      );

      const stepsData = weeklyData.map(day => day.data.steps || 0);
      
      const dayLabels = weeklyData.map(day => {
        const date = new Date(day.date);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return dayNames[date.getDay()];
      });

      setWeeklySteps({
        labels: dayLabels,
        datasets: [
          {
            data: stepsData,
            color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
            strokeWidth: 3,
          },
        ],
      });
    } catch (error) {
    }
  };

  const loadAchievements = async () => {
    if (!user?.uid) return;

    try {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString().split('T')[0];

      const yesterdayData = await FirestoreService.getFitnessData(user.uid, yesterdayString);
      const todayData = await FirestoreService.getFitnessData(user.uid, FirestoreService.getTodayDateString());

      const newAchievements = [];

      if (yesterdayData && yesterdayData.steps >= 10000) {
        newAchievements.push({
          icon: 'trophy',
          color: '#f59e0b',
          title: 'Step Goal Achieved!',
          description: `You reached ${yesterdayData.steps.toLocaleString()} steps yesterday`,
        });
      }

      if (todayData && todayData.workouts >= 3) {
        newAchievements.push({
          icon: 'flame',
          color: '#ef4444',
          title: 'Workout Champion',
          description: `You completed ${todayData.workouts} workouts today!`,
        });
      }

      if (todayData && todayData.calories >= 500) {
        newAchievements.push({
          icon: 'flame',
          color: '#ef4444',
          title: 'Calorie Goal Reached!',
          description: `You burned ${todayData.calories} calories today`,
        });
      }

      if (todayData && todayData.water >= 2000) {
        newAchievements.push({
          icon: 'water',
          color: '#06b6d4',
          title: 'Hydration Master',
          description: `You drank ${(todayData.water / 1000).toFixed(1)}L of water today`,
        });
      }

      if (newAchievements.length === 0) {
        newAchievements.push({
          icon: 'star',
          color: '#8b5cf6',
          title: 'Keep Going!',
          description: 'You\'re doing great! Keep tracking your progress.',
        });
      }

      setAchievements(newAchievements);
    } catch (error) {
      setAchievements([{
        icon: 'star',
        color: '#8b5cf6',
        title: 'Keep Going!',
        description: 'You\'re doing great! Keep tracking your progress.',
      }]);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'workout':
        navigation.navigate('Activity', { screen: 'AddWorkout' });
        break;
      case 'water':
        navigation.navigate('Activity', { screen: 'WaterTracker' });
        break;
      case 'steps':
        navigation.navigate('Activity', { screen: 'StepCounter' });
        break;
      default:
        break;
    }
  };

  const getProgressPercentage = (current, goal) => {
    return Math.min((current / goal) * 100, 100);
  };

  const StatCard = ({ 
    title, 
    current, 
    goal, 
    unit, 
    icon, 
    color 
  }) => {
    const percentage = getProgressPercentage(current, goal);
    
    return (
      <View style={styles.statCard}>
        <View style={styles.statHeader}>
          <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={24} color={color} />
          </View>
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={styles.statValue}>
          {current.toLocaleString()}{unit}
        </Text>
        <Text style={styles.statGoal}>Goal: {goal.toLocaleString()}{unit}</Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${percentage}%`, backgroundColor: color }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color }]}>
          {percentage.toFixed(0)}% Complete
        </Text>
      </View>
    );
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#0ea5e9',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}!
            </Text>
            <Text style={styles.username}>
              {user?.name ? `Welcome back, ${user.name}` : 'Ready to crush your goals?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#64748b" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleQuickAction('workout')}
            >
              <Ionicons name="add-circle" size={32} color="#0ea5e9" />
              <Text style={styles.actionText}>Log Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleQuickAction('water')}
            >
              <Ionicons name="water" size={32} color="#06b6d4" />
              <Text style={styles.actionText}>Add Water</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="restaurant" size={32} color="#f59e0b" />
              <Text style={styles.actionText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleQuickAction('steps')}
            >
              <Ionicons name="footsteps" size={32} color="#22c55e" />
              <Text style={styles.actionText}>Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todayStats}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <View style={styles.statsGrid}>
              <StatCard
                title="Steps"
                current={todayStats.steps}
                goal={goals.steps}
                unit=""
                icon="footsteps"
                color="#22c55e"
              />
              <StatCard
                title="Calories"
                current={todayStats.calories}
                goal={goals.calories}
                unit=" kcal"
                icon="flame"
                color="#ef4444"
              />
              <StatCard
                title="Water"
                current={todayStats.water}
                goal={goals.water}
                unit=" ml"
                icon="water"
                color="#06b6d4"
              />
              <StatCard
                title="Workouts"
                current={todayStats.workouts}
                goal={goals.workouts}
                unit=""
                icon="fitness"
                color="#8b5cf6"
              />
            </View>
          )}
        </View>

        <View style={styles.chartSection}>
          <Text style={styles.sectionTitle}>Weekly Steps</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={weeklySteps}
              width={screenWidth - 48}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        <View style={styles.achievements}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          {achievements.length === 0 ? (
            <View style={styles.emptyAchievements}>
              <Ionicons name="star-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No achievements yet</Text>
              <Text style={styles.emptySubtext}>Keep tracking to unlock achievements!</Text>
            </View>
          ) : (
            <View style={styles.achievementsList}>
              {achievements.map((achievement, index) => (
                <View key={index} style={styles.achievementItem}>
                  <View style={[styles.achievementIcon, { backgroundColor: `${achievement.color}20` }]}>
                    <Ionicons name={achievement.icon} size={24} color={achievement.color} />
                  </View>
                  <View style={styles.achievementContent}>
                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>
                  </View>
                </View>
              ))}
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  greeting: {
    fontSize: 24,
    color: '#1e293b',
    ...getFontStyle('bold'),
  },
  username: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 4,
    ...getFontStyle('regular'),
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  quickActions: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
  },
  actionText: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    ...getFontStyle('medium'),
  },
  todayStats: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('semiBold'),
  },
  statValue: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  statGoal: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
    ...getFontStyle('regular'),
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    ...getFontStyle('semiBold'),
  },
  chartSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  achievements: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    marginTop: 8,
    marginBottom: 20,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('semiBold'),
  },
  achievementDescription: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  emptyAchievements: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    ...getFontStyle('semiBold'),
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
    ...getFontStyle('regular'),
  },
});
