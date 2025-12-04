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
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';

export default function CalorieTrackerScreen() {
  const { user } = useUser();
  const [calories, setCalories] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(500);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    if (!user?.uid) return;
    try {
      const today = FirestoreService.getTodayDateString();
      const data = await FirestoreService.getFitnessData(user.uid, today);
      if (data) {
        setCalories(data.calories || 0);
        setDailyGoal(data.calorieGoal || 500);
      }
    } catch (error) {
    }
  };

  const addCalories = async (amount) => {
    const newCalories = calories + amount;
    setCalories(newCalories);
    
    if (user?.uid) {
      try {
        const today = FirestoreService.getTodayDateString();
        await FirestoreService.saveFitnessData(user.uid, today, {
          calories: newCalories,
        });
      } catch (error) {
      }
    }
  };

  const resetCalories = () => {
    setCalories(0);
    if (user?.uid) {
      const today = FirestoreService.getTodayDateString();
      FirestoreService.saveFitnessData(user.uid, today, {
        calories: 0,
      });
    }
  };

  const progressPercentage = Math.min((calories / dailyGoal) * 100, 100);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.calorieCircle}>
            <Ionicons name="flame" size={60} color="#ffffff" />
            <Text style={styles.calorieAmount}>{calories}</Text>
            <Text style={styles.calorieUnit}>kcal</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.goalText}>
              {calories} / {dailyGoal} kcal
            </Text>
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage)}% of daily goal
            </Text>
            <Text style={styles.remainingText}>
              {Math.max(0, dailyGoal - calories)} kcal remaining
            </Text>
          </View>
        </View>

        <View style={styles.quickAddContainer}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addCalories(50)}
            >
              <Text style={styles.quickAddAmount}>50</Text>
              <Text style={styles.quickAddLabel}>Light</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addCalories(100)}
            >
              <Text style={styles.quickAddAmount}>100</Text>
              <Text style={styles.quickAddLabel}>Moderate</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addCalories(200)}
            >
              <Text style={styles.quickAddAmount}>200</Text>
              <Text style={styles.quickAddLabel}>Intense</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.customAddContainer}>
          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.customButtons}>
            {[25, 75, 150, 250].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.customButton}
                onPress={() => addCalories(amount)}
              >
                <Text style={styles.customButtonText}>+{amount} kcal</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetCalories}
          >
            <Ionicons name="refresh" size={20} color="#64748b" />
            <Text style={styles.resetButtonText}>Reset</Text>
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
  calorieCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calorieAmount: {
    fontSize: 42,
    color: '#ffffff',
    marginTop: 8,
    ...getFontStyle('bold'),
  },
  calorieUnit: {
    fontSize: 16,
    color: '#ffffff',
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
    backgroundColor: '#ef4444',
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
    marginBottom: 8,
    ...getFontStyle('regular'),
  },
  remainingText: {
    fontSize: 14,
    color: '#ef4444',
    ...getFontStyle('medium'),
  },
  quickAddContainer: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#1e293b',
    marginBottom: 16,
    ...getFontStyle('bold'),
  },
  quickAddGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
  },
  quickAddAmount: {
    fontSize: 24,
    color: '#ef4444',
    marginBottom: 4,
    ...getFontStyle('bold'),
  },
  quickAddLabel: {
    fontSize: 14,
    color: '#64748b',
    ...getFontStyle('regular'),
  },
  customAddContainer: {
    padding: 24,
    paddingTop: 0,
  },
  customButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  customButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  customButtonText: {
    fontSize: 16,
    color: '#1e293b',
    ...getFontStyle('semiBold'),
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
