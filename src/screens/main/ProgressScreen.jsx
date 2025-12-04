import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';

export default function ProgressScreen() {
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [progressData, setProgressData] = useState([]);
  const [summary, setSummary] = useState({
    totalSteps: 0,
    totalCalories: 0,
    totalWorkouts: 0,
    totalWater: 0,
    avgSteps: 0,
    avgCalories: 0,
    bestDay: null,
    currentStreak: 0,
    totalDistance: 0,
  });
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
    }, [user?.uid, selectedPeriod])
  );

  const setupRealTimeUpdates = () => {
    cleanup();
    loadProgressData();
    
    refreshIntervalRef.current = setInterval(() => {
      loadProgressData();
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

  const loadProgressData = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date();
      let startDate = new Date();
      
      if (selectedPeriod === 'week') {
        startDate.setDate(today.getDate() - 7);
      } else {
        startDate.setDate(today.getDate() - 30);
      }

      const startDateString = startDate.toISOString().split('T')[0];
      const endDateString = today.toISOString().split('T')[0];
      
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }

      unsubscribeRef.current = FirestoreService.subscribeToFitnessDataRange(
        user.uid,
        startDateString,
        endDateString,
        (data) => {
          setProgressData(data);
          calculateSummary(data);
          setLoading(false);
          setRefreshing(false);
        }
      );
    } catch (error) {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calculateSummary = (data) => {
    if (!data || data.length === 0) {
      setSummary({
        totalSteps: 0,
        totalCalories: 0,
        totalWorkouts: 0,
        totalWater: 0,
        avgSteps: 0,
        avgCalories: 0,
        bestDay: null,
        currentStreak: 0,
        totalDistance: 0,
      });
      return;
    }

    const totals = data.reduce((acc, day) => ({
      totalSteps: acc.totalSteps + (day.data.steps || 0),
      totalCalories: acc.totalCalories + (day.data.calories || 0),
      totalWorkouts: acc.totalWorkouts + (day.data.workouts || 0),
      totalWater: acc.totalWater + (day.data.water || 0),
    }), { totalSteps: 0, totalCalories: 0, totalWorkouts: 0, totalWater: 0 });

    const daysWithData = data.filter(d => d.data.steps > 0 || d.data.workouts > 0).length || 1;
    
    const bestDay = data.reduce((best, day) => {
      const dayScore = (day.data.steps || 0) + (day.data.workouts || 0) * 1000;
      const bestScore = (best.data.steps || 0) + (best.data.workouts || 0) * 1000;
      return dayScore > bestScore ? day : best;
    }, data[0]);

    let streak = 0;
    const today = FirestoreService.getTodayDateString();
    for (let i = data.length - 1; i >= 0; i--) {
      const day = data[i];
      if (day.data.steps > 0 || day.data.workouts > 0) {
        streak++;
      } else {
        break;
      }
    }

    const avgStepLength = 0.762;
    const totalDistance = (totals.totalSteps * avgStepLength) / 1000;

    setSummary({
      ...totals,
      avgSteps: Math.round(totals.totalSteps / daysWithData),
      avgCalories: Math.round(totals.totalCalories / daysWithData),
      bestDay,
      currentStreak: streak,
      totalDistance,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProgressData();
  };

  const getMaxValue = (metric) => {
    if (progressData.length === 0) return 1;
    const values = progressData.map(d => d.data[metric] || 0);
    return Math.max(...values, 1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = today - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getBarHeight = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.max((value / maxValue) * 100, 5);
  };

  const getTrend = (metric) => {
    if (progressData.length < 2) return { direction: 'neutral', percentage: 0 };
    
    const recent = progressData.slice(-3).reduce((sum, d) => sum + (d.data[metric] || 0), 0) / 3;
    const previous = progressData.slice(-6, -3).reduce((sum, d) => sum + (d.data[metric] || 0), 0) / 3;
    
    if (previous === 0) return { direction: recent > 0 ? 'up' : 'neutral', percentage: 100 };
    
    const percentage = ((recent - previous) / previous) * 100;
    return {
      direction: percentage > 5 ? 'up' : percentage < -5 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
    };
  };

  const stepsTrend = getTrend('steps');
  const caloriesTrend = getTrend('calories');
  const workoutsTrend = getTrend('workouts');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
      <Text style={styles.title}>Progress</Text>
        <View style={styles.periodSelector}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
            onPress={() => {
              setSelectedPeriod('week');
              setLoading(true);
            }}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>
              Week
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
            onPress={() => {
              setSelectedPeriod('month');
              setLoading(true);
            }}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>
              Month
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && progressData.length === 0 ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading progress...</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Ionicons name="footsteps" size={24} color="#22c55e" />
                  <Text style={styles.summaryValue}>{summary.totalSteps.toLocaleString()}</Text>
                  <Text style={styles.summaryLabel}>Total Steps</Text>
                  <Text style={styles.summarySubtext}>Avg: {summary.avgSteps.toLocaleString()}/day</Text>
                  {stepsTrend.direction !== 'neutral' && (
                    <View style={styles.trendContainer}>
                      <Ionicons 
                        name={stepsTrend.direction === 'up' ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={stepsTrend.direction === 'up' ? '#22c55e' : '#ef4444'} 
                      />
                      <Text style={[styles.trendText, { color: stepsTrend.direction === 'up' ? '#22c55e' : '#ef4444' }]}>
                        {stepsTrend.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="flame" size={24} color="#ef4444" />
                  <Text style={styles.summaryValue}>{summary.totalCalories.toLocaleString()}</Text>
                  <Text style={styles.summaryLabel}>Total Calories</Text>
                  <Text style={styles.summarySubtext}>Avg: {summary.avgCalories}/day</Text>
                  {caloriesTrend.direction !== 'neutral' && (
                    <View style={styles.trendContainer}>
                      <Ionicons 
                        name={caloriesTrend.direction === 'up' ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={caloriesTrend.direction === 'up' ? '#22c55e' : '#ef4444'} 
                      />
                      <Text style={[styles.trendText, { color: caloriesTrend.direction === 'up' ? '#22c55e' : '#ef4444' }]}>
                        {caloriesTrend.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="fitness" size={24} color="#8b5cf6" />
                  <Text style={styles.summaryValue}>{summary.totalWorkouts}</Text>
                  <Text style={styles.summaryLabel}>Workouts</Text>
                  <Text style={styles.summarySubtext}>
                    {selectedPeriod === 'week' ? 'This week' : 'This month'}
                  </Text>
                  {workoutsTrend.direction !== 'neutral' && (
                    <View style={styles.trendContainer}>
                      <Ionicons 
                        name={workoutsTrend.direction === 'up' ? 'trending-up' : 'trending-down'} 
                        size={12} 
                        color={workoutsTrend.direction === 'up' ? '#22c55e' : '#ef4444'} 
                      />
                      <Text style={[styles.trendText, { color: workoutsTrend.direction === 'up' ? '#22c55e' : '#ef4444' }]}>
                        {workoutsTrend.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.summaryCard}>
                  <Ionicons name="water" size={24} color="#06b6d4" />
                  <Text style={styles.summaryValue}>
                    {(summary.totalWater / 1000).toFixed(1)}L
                  </Text>
                  <Text style={styles.summaryLabel}>Water Intake</Text>
                  <Text style={styles.summarySubtext}>
                    {selectedPeriod === 'week' ? 'This week' : 'This month'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.insightsContainer}>
              <Text style={styles.sectionTitle}>Insights</Text>
              <View style={styles.insightsGrid}>
                <View style={styles.insightCard}>
                  <Ionicons name="trophy" size={20} color="#fbbf24" />
                  <Text style={styles.insightLabel}>Best Day</Text>
                  <Text style={styles.insightValue}>
                    {summary.bestDay ? formatDate(summary.bestDay.date) : 'N/A'}
                  </Text>
                  {summary.bestDay && (
                    <Text style={styles.insightSubtext}>
                      {summary.bestDay.data.steps.toLocaleString()} steps
                    </Text>
                  )}
                </View>
                <View style={styles.insightCard}>
                  <Ionicons name="flame" size={20} color="#ef4444" />
                  <Text style={styles.insightLabel}>Current Streak</Text>
                  <Text style={styles.insightValue}>{summary.currentStreak} days</Text>
                  <Text style={styles.insightSubtext}>Keep it up!</Text>
                </View>
                <View style={styles.insightCard}>
                  <Ionicons name="walk" size={20} color="#22c55e" />
                  <Text style={styles.insightLabel}>Total Distance</Text>
                  <Text style={styles.insightValue}>{summary.totalDistance.toFixed(1)} km</Text>
                  <Text style={styles.insightSubtext}>
                    {selectedPeriod === 'week' ? 'This week' : 'This month'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Steps Progress</Text>
              {progressData.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>No data available</Text>
                </View>
              ) : (
                <View style={styles.chart}>
                  {progressData.map((day, index) => {
                    const maxSteps = getMaxValue('steps');
                    const height = getBarHeight(day.data.steps || 0, maxSteps);
                    return (
                      <View key={index} style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${height}%`, backgroundColor: '#22c55e' }]} />
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {formatDate(day.date)}
                        </Text>
                        <Text style={styles.barValue}>
                          {(day.data.steps || 0).toLocaleString()}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Calories Progress</Text>
              {progressData.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>No data available</Text>
                </View>
              ) : (
                <View style={styles.chart}>
                  {progressData.map((day, index) => {
                    const maxCalories = getMaxValue('calories');
                    const height = getBarHeight(day.data.calories || 0, maxCalories);
                    return (
                      <View key={index} style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${height}%`, backgroundColor: '#ef4444' }]} />
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {formatDate(day.date)}
                        </Text>
                        <Text style={styles.barValue}>
                          {day.data.calories || 0}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Workouts Progress</Text>
              {progressData.length === 0 ? (
                <View style={styles.emptyChart}>
                  <Ionicons name="bar-chart-outline" size={48} color="#94a3b8" />
                  <Text style={styles.emptyText}>No data available</Text>
                </View>
              ) : (
                <View style={styles.chart}>
                  {progressData.map((day, index) => {
                    const maxWorkouts = getMaxValue('workouts');
                    const height = getBarHeight(day.data.workouts || 0, maxWorkouts);
                    return (
                      <View key={index} style={styles.barContainer}>
                        <View style={[styles.bar, { height: `${height}%`, backgroundColor: '#8b5cf6' }]} />
                        <Text style={styles.barLabel} numberOfLines={1}>
                          {formatDate(day.date)}
                        </Text>
                        <Text style={styles.barValue}>
                          {day.data.workouts || 0}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </>
        )}
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
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  periodButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('semiBold'),
  },
  periodButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  summaryContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
    ...getFontStyle('semiBold'),
  },
  summarySubtext: {
    fontSize: 12,
    color: '#94a3b8',
    ...getFontStyle('regular'),
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    ...getFontStyle('semiBold'),
  },
  insightsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  insightsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  insightLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
    ...getFontStyle('regular'),
  },
  insightValue: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  insightSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    ...getFontStyle('regular'),
  },
  chartContainer: {
    padding: 24,
    paddingTop: 0,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyChart: {
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 12,
    ...getFontStyle('regular'),
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  bar: {
    width: '80%',
    minHeight: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    ...getFontStyle('regular'),
  },
  barValue: {
    fontSize: 10,
    color: '#1e293b',
    marginTop: 4,
    ...getFontStyle('semiBold'),
  },
});
