import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { getFontStyle } from '../../utils/fonts';
import { useUser } from '../../contexts/UserContext';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen() {
  const { user } = useUser();
  const todayStats = {
    steps: 8547,
    calories: 342,
    water: 1200,
    workouts: 1,
  };

  const goals = {
    steps: 10000,
    calories: 500,
    water: 2000,
    workouts: 1,
  };

  const weeklySteps = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [7200, 8500, 6800, 9200, 8547, 0, 0],
        color: (opacity = 1) => `rgba(14, 165, 233, ${opacity})`,
        strokeWidth: 3,
      },
    ],
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={32} color="#0ea5e9" />
              <Text style={styles.actionText}>Log Workout</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="water" size={32} color="#06b6d4" />
              <Text style={styles.actionText}>Add Water</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="restaurant" size={32} color="#f59e0b" />
              <Text style={styles.actionText}>Log Meal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="footsteps" size={32} color="#22c55e" />
              <Text style={styles.actionText}>Steps</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.todayStats}>
          <Text style={styles.sectionTitle}>Today's Progress</Text>
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
          <View style={styles.achievementsList}>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Ionicons name="trophy" size={24} color="#f59e0b" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Step Goal Achieved!</Text>
                <Text style={styles.achievementDescription}>You reached 10,000 steps yesterday</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <View style={styles.achievementIcon}>
                <Ionicons name="flame" size={24} color="#ef4444" />
              </View>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Calorie Burner</Text>
                <Text style={styles.achievementDescription}>3-day workout streak completed</Text>
              </View>
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
    backgroundColor: '#fef3c7',
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
});

