import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';

export default function WorkoutLogScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [workouts, setWorkouts] = useState([]);
  const [todayWorkouts, setTodayWorkouts] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    return unsubscribe;
  }, [navigation]);

  const loadData = async () => {
    if (!user?.uid) return;
    try {
      const today = FirestoreService.getTodayDateString();
      const data = await FirestoreService.getFitnessData(user.uid, today);
      if (data) {
        setTodayWorkouts(data.workouts || 0);
      }
      
      const workoutsList = await FirestoreService.getWorkouts(user.uid, 20);
      setWorkouts(workoutsList);
    } catch (error) {
    }
  };

  const addWorkout = async () => {
    const newCount = todayWorkouts + 1;
    setTodayWorkouts(newCount);
    
    if (user?.uid) {
      try {
        const today = FirestoreService.getTodayDateString();
        await FirestoreService.saveFitnessData(user.uid, today, {
          workouts: newCount,
        });
      } catch (error) {
      }
    }
  };

  const resetWorkouts = () => {
    Alert.alert(
      'Reset Workouts',
      'Are you sure you want to reset today\'s workout count?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setTodayWorkouts(0);
            if (user?.uid) {
              const today = FirestoreService.getTodayDateString();
              await FirestoreService.saveFitnessData(user.uid, today, {
                workouts: 0,
              });
            }
          },
        },
      ]
    );
  };

  const getWorkoutIcon = (type) => {
    switch (type) {
      case 'cardio': return 'bicycle';
      case 'strength': return 'barbell';
      case 'flexibility': return 'body';
      case 'sports': return 'football';
      default: return 'fitness';
    }
  };

  const getWorkoutTypeName = (type) => {
    switch (type) {
      case 'cardio': return 'Cardio';
      case 'strength': return 'Strength';
      case 'flexibility': return 'Flexibility';
      case 'sports': return 'Sports';
      default: return 'Other';
    }
  };

  const formatDate = (date) => {
    const today = new Date();
    const workoutDate = new Date(date);
    const diffTime = today - workoutDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return workoutDate.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Ionicons name="fitness" size={32} color="#8b5cf6" />
              <Text style={styles.statValue}>{todayWorkouts}</Text>
              <Text style={styles.statLabel}>Today's Workouts</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddWorkout')}
          >
            <Ionicons name="add-circle" size={24} color="#ffffff" />
            <Text style={styles.addButtonText}>Add Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAddButton}
            onPress={addWorkout}
          >
            <Ionicons name="flash" size={20} color="#8b5cf6" />
            <Text style={styles.quickAddButtonText}>Quick Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.workoutsContainer}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          
          {workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
            >
              <View style={styles.workoutIcon}>
                <Ionicons 
                  name={getWorkoutIcon(workout.type)} 
                  size={24} 
                  color="#8b5cf6" 
                />
              </View>
              <View style={styles.workoutInfo}>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <View style={styles.workoutDetails}>
                  <Text style={styles.workoutDetail}>{getWorkoutTypeName(workout.type)}</Text>
                  <Text style={styles.workoutDetail}>•</Text>
                  <Text style={styles.workoutDetail}>{workout.duration} min</Text>
                  {workout.calories > 0 && (
                    <>
                      <Text style={styles.workoutDetail}>•</Text>
                      <Text style={styles.workoutDetail}>{workout.calories} kcal</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.workoutDate}>
                <Text style={styles.workoutDateText}>{formatDate(workout.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}

          {workouts.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={64} color="#cbd5e1" />
              <Text style={styles.emptyStateText}>No workouts logged yet</Text>
              <Text style={styles.emptyStateSubtext}>Start tracking your fitness journey!</Text>
            </View>
          )}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetWorkouts}
          >
            <Ionicons name="refresh" size={20} color="#64748b" />
            <Text style={styles.resetButtonText}>Reset Today</Text>
          </TouchableOpacity>
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
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 36,
    color: '#8b5cf6',
    marginTop: 8,
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    color: '#ffffff',
    ...getFontStyle('semiBold'),
  },
  quickAddButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3e8ff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  quickAddButtonText: {
    fontSize: 16,
    color: '#8b5cf6',
    ...getFontStyle('semiBold'),
  },
  workoutsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  workoutCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  workoutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('semiBold'),
  },
  workoutDetails: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  workoutDetail: {
    fontSize: 12,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  workoutDate: {
    alignItems: 'flex-end',
  },
  workoutDateText: {
    fontSize: 12,
    color: '#94a3b8',
    ...getFontStyle('regular'),
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    color: '#64748b',
    marginTop: 16,
    ...getFontStyle('semiBold'),
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 8,
    ...getFontStyle('regular'),
  },
  controlsContainer: {
    padding: 24,
    paddingTop: 0,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#64748b',
    ...getFontStyle('semiBold'),
  },
});
