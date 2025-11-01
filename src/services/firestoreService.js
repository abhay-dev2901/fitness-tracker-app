import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export class FirestoreService {
  static async createUserProfile(uid, userData) {
    try {
      const userRef = doc(db, 'users', uid);
      
      const userProfile = {
        uid,
        name: userData.name || '',
        email: userData.email || '',
        fitnessGoals: userData.fitnessGoals || [],
        activityLevel: userData.activityLevel || 'moderately_active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (userData.profilePicture !== undefined) {
        userProfile.profilePicture = userData.profilePicture;
      }
      if (userData.height !== undefined) {
        userProfile.height = userData.height;
      }
      if (userData.weight !== undefined) {
        userProfile.weight = userData.weight;
      }
      if (userData.age !== undefined) {
        userProfile.age = userData.age;
      }
      
      await setDoc(userRef, userProfile);
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  static async getUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data();
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get user profile: ${error.message}`);
    }
  }

  static async updateUserProfile(uid, updates) {
    try {
      const userRef = doc(db, 'users', uid);
      
      const filteredUpdates = {
        updatedAt: serverTimestamp(),
      };

      Object.keys(updates).forEach(key => {
        const value = updates[key];
        if (value !== undefined) {
          filteredUpdates[key] = value;
        }
      });
      
      await updateDoc(userRef, filteredUpdates);
    } catch (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }
  }

  static async deleteUserProfile(uid) {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  }

  static async saveFitnessData(uid, date, data) {
    try {
      const fitnessRef = doc(db, 'fitness_data', `${uid}_${date}`);
      const fitnessData = {
        uid,
        date,
        steps: data.steps || 0,
        calories: data.calories || 0,
        water: data.water || 0,
        workouts: data.workouts || 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await setDoc(fitnessRef, fitnessData, { merge: true });
    } catch (error) {
      throw new Error(`Failed to save fitness data: ${error.message}`);
    }
  }

  static async getFitnessData(uid, date) {
    try {
      const fitnessRef = doc(db, 'fitness_data', `${uid}_${date}`);
      const fitnessSnap = await getDoc(fitnessRef);
      
      if (fitnessSnap.exists()) {
        return fitnessSnap.data();
      }
      return null;
    } catch (error) {
      throw new Error(`Failed to get fitness data: ${error.message}`);
    }
  }

  static async updateFitnessData(uid, date, updates) {
    try {
      const fitnessRef = doc(db, 'fitness_data', `${uid}_${date}`);
      await updateDoc(fitnessRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw new Error(`Failed to update fitness data: ${error.message}`);
    }
  }

  static getTodayDateString() {
    return new Date().toISOString().split('T')[0];
  }

  static async initializeTodaysFitnessData(uid) {
    const today = this.getTodayDateString();
    const existingData = await this.getFitnessData(uid, today);
    
    if (!existingData) {
      await this.saveFitnessData(uid, today, {
        steps: 0,
        calories: 0,
        water: 0,
        workouts: 0,
      });
    }
  }
}

