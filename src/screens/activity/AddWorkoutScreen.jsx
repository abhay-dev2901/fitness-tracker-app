import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { FirestoreService } from '../../services/firestoreService';
import { getFontStyle } from '../../utils/fonts';
import Button from '../../components/Button';

export default function AddWorkoutScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [duration, setDuration] = useState('');
  const [calories, setCalories] = useState('');
  const [loading, setLoading] = useState(false);

  const workoutTypes = [
    { id: 'cardio', name: 'Cardio', icon: 'bicycle', color: '#ef4444' },
    { id: 'strength', name: 'Strength', icon: 'barbell', color: '#8b5cf6' },
    { id: 'flexibility', name: 'Flexibility', icon: 'body', color: '#06b6d4' },
    { id: 'sports', name: 'Sports', icon: 'football', color: '#22c55e' },
    { id: 'other', name: 'Other', icon: 'fitness', color: '#64748b' },
  ];

  const handleSave = async () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    if (!workoutType) {
      Alert.alert('Error', 'Please select a workout type');
      return;
    }
    if (!duration.trim()) {
      Alert.alert('Error', 'Please enter workout duration');
      return;
    }

    setLoading(true);
    try {
      if (!user?.uid) {
        Alert.alert('Error', 'User not logged in. Please sign in again.');
        setLoading(false);
        return;
      }

      await FirestoreService.saveWorkout(user.uid, {
        name: workoutName,
        type: workoutType,
        duration: duration,
        calories: calories,
      });

      const today = FirestoreService.getTodayDateString();
      const currentData = await FirestoreService.getFitnessData(user.uid, today);
      const currentWorkouts = currentData?.workouts || 0;
      const currentCalories = currentData?.calories || 0;
      const caloriesToAdd = parseInt(calories) || 0;

      await FirestoreService.saveFitnessData(user.uid, today, {
        workouts: currentWorkouts + 1,
        calories: currentCalories + caloriesToAdd,
      });

      Alert.alert('Success', 'Workout added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      const errorMessage = error.message || 'Failed to save workout. Please check your internet connection and try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Workout Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning Run, Weight Training"
              placeholderTextColor="#94a3b8"
              value={workoutName}
              onChangeText={setWorkoutName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Workout Type</Text>
            <View style={styles.typeGrid}>
              {workoutTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    workoutType === type.id && styles.typeButtonSelected,
                    workoutType === type.id && { borderColor: type.color }
                  ]}
                  onPress={() => setWorkoutType(type.id)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={24} 
                    color={workoutType === type.id ? type.color : '#64748b'} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    workoutType === type.id && { color: type.color }
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 30"
              placeholderTextColor="#94a3b8"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Calories Burned (optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 250"
              placeholderTextColor="#94a3b8"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </View>

          <Button
            title="Save Workout"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
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
  form: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
    ...getFontStyle('semiBold'),
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1e293b',
    ...getFontStyle('regular'),
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  typeButtonSelected: {
    backgroundColor: '#f8fafc',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    ...getFontStyle('semiBold'),
  },
  saveButton: {
    marginTop: 8,
  },
});
