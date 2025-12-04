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

export default function WaterTrackerScreen() {
  const { user } = useUser();
  const [waterIntake, setWaterIntake] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(2000);

  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    if (!user?.uid) return;
    try {
      const today = FirestoreService.getTodayDateString();
      const data = await FirestoreService.getFitnessData(user.uid, today);
      if (data) {
        setWaterIntake(data.water || 0);
        setDailyGoal(data.waterGoal || 2000);
      }
    } catch (error) {
    }
  };

  const addWater = async (amount) => {
    const newAmount = waterIntake + amount;
    setWaterIntake(newAmount);
    
    if (user?.uid) {
      try {
        const today = FirestoreService.getTodayDateString();
        await FirestoreService.saveFitnessData(user.uid, today, {
          water: newAmount,
        });
      } catch (error) {
      }
    }
  };

  const resetWater = () => {
    setWaterIntake(0);
    if (user?.uid) {
      const today = FirestoreService.getTodayDateString();
      FirestoreService.saveFitnessData(user.uid, today, {
        water: 0,
      });
    }
  };

  const progressPercentage = Math.min((waterIntake / dailyGoal) * 100, 100);
  const glasses = Math.round(waterIntake / 250);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.waterCircle}>
            <Ionicons name="water" size={60} color="#06b6d4" />
            <Text style={styles.waterAmount}>{waterIntake}</Text>
            <Text style={styles.waterUnit}>ml</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[styles.progressFill, { width: `${progressPercentage}%` }]} 
              />
            </View>
            <Text style={styles.goalText}>
              {waterIntake} / {dailyGoal} ml
            </Text>
            <Text style={styles.percentageText}>
              {Math.round(progressPercentage)}% of daily goal
            </Text>
            <Text style={styles.glassesText}>
              {glasses} glasses (250ml each)
            </Text>
          </View>
        </View>

        <View style={styles.quickAddContainer}>
          <Text style={styles.sectionTitle}>Quick Add</Text>
          <View style={styles.quickAddGrid}>
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addWater(250)}
            >
              <Text style={styles.quickAddAmount}>250ml</Text>
              <Text style={styles.quickAddLabel}>Glass</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addWater(500)}
            >
              <Text style={styles.quickAddAmount}>500ml</Text>
              <Text style={styles.quickAddLabel}>Bottle</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickAddButton}
              onPress={() => addWater(1000)}
            >
              <Text style={styles.quickAddAmount}>1L</Text>
              <Text style={styles.quickAddLabel}>Large</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.customAddContainer}>
          <Text style={styles.sectionTitle}>Custom Amount</Text>
          <View style={styles.customButtons}>
            {[100, 200, 300, 400].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.customButton}
                onPress={() => addWater(amount)}
              >
                <Text style={styles.customButtonText}>+{amount}ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={resetWater}
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
  waterCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#06b6d4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  waterAmount: {
    fontSize: 42,
    color: '#ffffff',
    marginTop: 8,
    ...getFontStyle('bold'),
  },
  waterUnit: {
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
    backgroundColor: '#06b6d4',
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
  glassesText: {
    fontSize: 14,
    color: '#06b6d4',
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
    borderColor: '#06b6d4',
  },
  quickAddAmount: {
    fontSize: 24,
    color: '#06b6d4',
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
