import React, { useState, useEffect } from 'react';
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

export default function SocialScreen() {
  const { user } = useUser();
  const [selectedMetric, setSelectedMetric] = useState('steps');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [userStats, setUserStats] = useState({
    steps: 0,
    calories: 0,
    workouts: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadLeaderboard();
    }, [user?.uid, selectedMetric])
  );

  const loadLeaderboard = async () => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    try {
      const today = FirestoreService.getTodayDateString();
      const todayData = await FirestoreService.getFitnessData(user.uid, today);
      
      if (todayData) {
        setUserStats({
          steps: todayData.steps || 0,
          calories: todayData.calories || 0,
          workouts: todayData.workouts || 0,
        });
      }

      const board = await FirestoreService.getLeaderboard(selectedMetric, 20);
      setLeaderboard(board);

      const userIndex = board.findIndex(entry => entry.uid === user.uid);
      if (userIndex !== -1) {
        setUserRank(userIndex + 1);
      } else {
        setUserRank(null);
      }
    } catch (error) {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLeaderboard();
  };

  const getMetricIcon = (metric) => {
    switch (metric) {
      case 'steps': return 'footsteps';
      case 'calories': return 'flame';
      case 'workouts': return 'fitness';
      default: return 'trophy';
    }
  };

  const getMetricColor = (metric) => {
    switch (metric) {
      case 'steps': return '#22c55e';
      case 'calories': return '#ef4444';
      case 'workouts': return '#8b5cf6';
      default: return '#0ea5e9';
    }
  };

  const getMetricLabel = (metric) => {
    switch (metric) {
      case 'steps': return 'Steps';
      case 'calories': return 'Calories';
      case 'workouts': return 'Workouts';
      default: return 'Score';
    }
  };

  const formatValue = (value, metric) => {
    if (metric === 'steps') {
      return value.toLocaleString();
    } else if (metric === 'water') {
      return `${(value / 1000).toFixed(1)}L`;
    }
    return value.toString();
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return 'trophy';
    if (rank === 2) return 'medal';
    if (rank === 3) return 'medal';
    return 'person';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#64748b';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <View style={styles.metricSelector}>
          <TouchableOpacity
            style={[styles.metricButton, selectedMetric === 'steps' && styles.metricButtonActive]}
            onPress={() => setSelectedMetric('steps')}
          >
            <Ionicons 
              name="footsteps" 
              size={16} 
              color={selectedMetric === 'steps' ? '#ffffff' : '#64748b'} 
            />
            <Text style={[styles.metricButtonText, selectedMetric === 'steps' && styles.metricButtonTextActive]}>
              Steps
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricButton, selectedMetric === 'calories' && styles.metricButtonActive]}
            onPress={() => setSelectedMetric('calories')}
          >
            <Ionicons 
              name="flame" 
              size={16} 
              color={selectedMetric === 'calories' ? '#ffffff' : '#64748b'} 
            />
            <Text style={[styles.metricButtonText, selectedMetric === 'calories' && styles.metricButtonTextActive]}>
              Calories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.metricButton, selectedMetric === 'workouts' && styles.metricButtonActive]}
            onPress={() => setSelectedMetric('workouts')}
          >
            <Ionicons 
              name="fitness" 
              size={16} 
              color={selectedMetric === 'workouts' ? '#ffffff' : '#64748b'} 
            />
            <Text style={[styles.metricButtonText, selectedMetric === 'workouts' && styles.metricButtonTextActive]}>
              Workouts
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
        <View style={styles.userStatsCard}>
          <Text style={styles.userStatsTitle}>Your Today's Stats</Text>
          <View style={styles.userStatsRow}>
            <View style={styles.userStatItem}>
              <Ionicons name="footsteps" size={20} color="#22c55e" />
              <Text style={styles.userStatValue}>{formatValue(userStats.steps, 'steps')}</Text>
              <Text style={styles.userStatLabel}>Steps</Text>
            </View>
            <View style={styles.userStatItem}>
              <Ionicons name="flame" size={20} color="#ef4444" />
              <Text style={styles.userStatValue}>{formatValue(userStats.calories, 'calories')}</Text>
              <Text style={styles.userStatLabel}>Calories</Text>
            </View>
            <View style={styles.userStatItem}>
              <Ionicons name="fitness" size={20} color="#8b5cf6" />
              <Text style={styles.userStatValue}>{userStats.workouts}</Text>
              <Text style={styles.userStatLabel}>Workouts</Text>
            </View>
          </View>
          {userRank && (
            <View style={styles.rankBadge}>
              <Ionicons name="trophy" size={16} color="#fbbf24" />
              <Text style={styles.rankText}>Your Rank: #{userRank}</Text>
            </View>
          )}
        </View>

        <View style={styles.leaderboardContainer}>
          <Text style={styles.sectionTitle}>
            Top {getMetricLabel(selectedMetric)} Leaders
          </Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyText}>No data available yet</Text>
              <Text style={styles.emptySubtext}>Be the first to set a record!</Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isCurrentUser = entry.uid === user?.uid;
                return (
                  <View
                    key={entry.uid}
                    style={[
                      styles.leaderboardItem,
                      isCurrentUser && styles.leaderboardItemCurrent
                    ]}
                  >
                    <View style={styles.rankContainer}>
                      {rank <= 3 ? (
                        <Ionicons 
                          name={getRankIcon(rank)} 
                          size={24} 
                          color={getRankColor(rank)} 
                        />
                      ) : (
                        <View style={styles.rankNumber}>
                          <Text style={styles.rankNumberText}>{rank}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>
                        {entry.name}
                        {isCurrentUser && ' (You)'}
                      </Text>
                    </View>
                    <View style={styles.scoreContainer}>
                      <Ionicons 
                        name={getMetricIcon(selectedMetric)} 
                        size={18} 
                        color={getMetricColor(selectedMetric)} 
                      />
                      <Text style={[styles.score, { color: getMetricColor(selectedMetric) }]}>
                        {formatValue(entry.value, selectedMetric)}
                      </Text>
                    </View>
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
  metricSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  metricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricButtonActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  metricButtonText: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('semiBold'),
  },
  metricButtonTextActive: {
    color: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  userStatsCard: {
    margin: 24,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userStatsTitle: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  userStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 20,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  userStatLabel: {
    fontSize: 12,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    gap: 8,
  },
  rankText: {
    fontSize: 14,
    color: '#1e293b',
    ...getFontStyle('semiBold'),
  },
  leaderboardContainer: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
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
  leaderboardList: {
    gap: 12,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  leaderboardItemCurrent: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
    backgroundColor: '#f0f9ff',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumberText: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('bold'),
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: '#1e293b',
    ...getFontStyle('semiBold'),
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  score: {
    fontSize: 16,
    ...getFontStyle('bold'),
  },
});
