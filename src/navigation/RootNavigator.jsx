import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';
import { useEffect, useState, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WelcomeScreen from '../screens/WelcomeScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createNativeStackNavigator();

const HAS_SEEN_ONBOARDING_KEY = '@fitness_tracker_has_seen_onboarding';

export default function RootNavigator() {
  const { isLoggedIn, isLoading } = useUser();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(null);
  const navigationRef = useRef(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isInitialMount.current) {
      if (!isLoading && hasSeenOnboarding !== null) {
        isInitialMount.current = false;
      }
      return;
    }

    if (!isLoading && hasSeenOnboarding !== null && navigationRef.current) {
      if (isLoggedIn) {
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        const route = hasSeenOnboarding ? 'Auth' : 'Welcome';
        navigationRef.current.reset({
          index: 0,
          routes: [{ name: route }],
        });
      }
    }
  }, [isLoggedIn, isLoading, hasSeenOnboarding]);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY);
      setHasSeenOnboarding(value === 'true');
    } catch (error) {
      setHasSeenOnboarding(false);
    }
  };

  const markOnboardingAsSeen = async () => {
    try {
      await AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
    }
  };

  if (isLoading || hasSeenOnboarding === null) {
    return null;
  }

  const initialRoute = isLoggedIn ? "Main" : hasSeenOnboarding ? "Auth" : "Welcome";

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

