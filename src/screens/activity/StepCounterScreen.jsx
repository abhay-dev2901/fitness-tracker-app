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
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';

export default function StepCounterScreen() {
  const { user } = useUser();
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(10000);
  const [distance, setDistance] = useState(0);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    loadTodayData();
  }, []);

  useEffect(() => {
    let interval;
    let saveInterval;
    if (isTracking) {
      interval = setInterval(() => {
        setSteps(prev => {
          const newSteps = prev + 1;
          calculateMetrics(newSteps);
          return newSteps;
        });
      }, 2000);
      
      saveInterval = setInterval(() => {
        setSteps(currentSteps => {
          saveSteps(currentSteps);
          return currentSteps;
        });
      }, 10000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (saveInterval) {
        clearInterval(saveInterval);
      }
    };
  }, [isTracking, user?.uid]);

  const loadTodayData = async () => {
    if (!user?.uid) return;
    try {
      const today = FirestoreService.getTodayDateString();
      const data = await FirestoreService.getFitnessData(user.uid, today);
      if (data) {
        setSteps(data.steps || 0);
        setDailyGoal(data.stepGoal || 10000);
        calculateMetrics(data.steps || 0);
      }
    } catch (error) {
    }
  };

  const calculateMetrics = (stepCount) => {
    const avgStepLength = 0.762;
    const calculatedDistance = (stepCount * avgStepLength) / 1000;
    setDistance(calculatedDistance);
    
    const caloriesPerStep = 0.04;
    const calculatedCalories = Math.round(stepCount * caloriesPerStep);
    setCalories(calculatedCalories);
  };

  const startTracking = async () => {
    setIsTracking(true);
  };

  const stopTracking = async () => {
    setIsTracking(false);
    await saveSteps();
  };

  const saveSteps = async (stepCount = steps) => {
    if (!user?.uid) return;
    try {
      const today = FirestoreService.getTodayDateString();
      await FirestoreService.saveFitnessData(user.uid, today, {
        steps: stepCount,
        calories: Math.round(stepCount * 0.04),
      });
    } catch (error) {
    }
  };

  const resetSteps = () => {
    Alert.alert(
      'Reset Steps',
      'Are you sure you want to reset today\'s steps?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            setSteps(0);
            setDistance(0);
            setCalories(0);
            await saveSteps(0);
          },
        },
      ]
    );
  };

  const progressPercentage = Math.min((steps / dailyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.stepCircle}>
            <Text style={styles.stepCount}>{steps.toLocaleString()}</Text>
            <Text style={styles.stepLabel}>Steps</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.goalText}>
              {steps.toLocaleString()} / {dailyGoal.toLocaleString()} steps
            </Text>
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage)}% of daily goal
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="walk" size={32} color="#22c55e" />
            <Text style={styles.statValue}>{distance.toFixed(2)}</Text>
            <Text style={styles.statLabel}>Kilometers</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="flame" size={32} color="#ef4444" />
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Calories</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          {!isTracking ? (
            <TouchableOpacity
              style={[styles.button, styles.startButton]}
              onPress={startTracking}
            >
              <Ionicons name="play" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Start Auto Tracking</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.stopButton]}
              onPress={stopTracking}
            >
              <Ionicons name="stop" size={24} color="#ffffff" />
              <Text style={styles.buttonText}>Stop Auto Tracking</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetSteps}
          >
            <Ionicons name="refresh" size={24} color="#64748b" />
            <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.manualControls}>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={async () => {
              const newSteps = steps + 1;
              setSteps(newSteps);
              calculateMetrics(newSteps);
              await saveSteps(newSteps);
            }}
          >
            <Ionicons name="add-circle" size={32} color="#22c55e" />
            <Text style={styles.manualButtonText}>Add Step</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.manualButton}
            onPress={async () => {
              const newSteps = steps + 10;
              setSteps(newSteps);
              calculateMetrics(newSteps);
              await saveSteps(newSteps);
            }}
          >
            <Ionicons name="add" size={32} color="#22c55e" />
            <Text style={styles.manualButtonText}>+10 Steps</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  stepCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepCount: {
    fontSize: 48,
    color: '#ffffff',
    ...getFontStyle('bold'),
  },
  stepLabel: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 4,
    ...getFontStyle('medium'),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 6,
  },
  goalText: {
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
    ...getFontStyle('semiBold'),
  },
  percentageText: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statValue: {
    fontSize: 28,
    color: '#1e293b',
    marginTop: 8,
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  controlsContainer: {
    padding: 24,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  startButton: {
    backgroundColor: '#22c55e',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  resetButton: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonText: {
    fontSize: 18,
    color: '#ffffff',
    ...getFontStyle('semiBold'),
  },
  resetButtonText: {
    color: '#64748b',
  },
  manualControls: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
  },
  manualButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  manualButtonText: {
    fontSize: 14,
    color: '#1e293b',
    marginTop: 8,
    ...getFontStyle('semiBold'),
  },
});
