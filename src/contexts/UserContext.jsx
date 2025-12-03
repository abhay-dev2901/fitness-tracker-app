import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { FirestoreService } from '../services/firestoreService';

const UserContext = createContext(undefined);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged(async (firebaseUser) => {
      setIsLoading(true);
      
      if (firebaseUser) {
        setAuthUser(firebaseUser);
        
        try {
          const userProfile = await FirestoreService.getUserProfile(firebaseUser.uid);
          
          if (userProfile) {
            setUser({
              uid: userProfile.uid,
              name: userProfile.name,
              email: userProfile.email,
              profilePicture: userProfile.profilePicture,
              joinedDate: userProfile.createdAt?.toDate().toISOString(),
              height: userProfile.height,
              weight: userProfile.weight,
              age: userProfile.age,
              fitnessGoals: userProfile.fitnessGoals,
              activityLevel: userProfile.activityLevel,
            });
            
            await FirestoreService.initializeTodaysFitnessData(firebaseUser.uid);
          } else {
            const basicProfile = {
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
            };
            
            await FirestoreService.createUserProfile(firebaseUser.uid, basicProfile);
            
            setUser({
              uid: firebaseUser.uid,
              name: basicProfile.name,
              email: basicProfile.email,
              joinedDate: new Date().toISOString(),
            });
            
            await FirestoreService.initializeTodaysFitnessData(firebaseUser.uid);
          }
        } catch (error) {
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            joinedDate: new Date().toISOString(),
          });
        }
      } else {
        setAuthUser(null);
        setUser(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email, password, name) => {
    try {
      setIsLoading(true);
      const authUser = await AuthService.signUp(email, password, name);
      
      await FirestoreService.createUserProfile(authUser.uid, {
        name,
        email,
      });
      
      await FirestoreService.initializeTodaysFitnessData(authUser.uid);
      
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      await AuthService.signIn(email, password);
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const googleUser = await AuthService.signInWithGoogle();
      
      try {
        const userProfile = await FirestoreService.getUserProfile(googleUser.uid);
        
        if (!userProfile) {
          await FirestoreService.createUserProfile(googleUser.uid, {
            name: googleUser.displayName || 'User',
            email: googleUser.email || '',
            profilePicture: googleUser.photoURL || null,
          });
          
          await FirestoreService.initializeTodaysFitnessData(googleUser.uid);
        }
      } catch (error) {
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await AuthService.signOut();
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (updates) => {
    if (!authUser) return;
    
    try {
      await FirestoreService.updateUserProfile(authUser.uid, updates);
      setUser(prev => prev ? { ...prev, ...updates } : null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    authUser,
    isLoading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserProfile,
    isLoggedIn: !!authUser,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

