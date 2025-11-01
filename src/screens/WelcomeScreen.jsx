import React from 'react';
import { View, Text, StyleSheet, Dimensions, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/Button';
import { getFontStyle } from '../utils/fonts';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const handleGetStarted = () => {
    navigation.navigate('Onboarding');
  };

  const handleSignIn = () => {
    navigation.navigate('Auth');
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <View style={styles.container}>
        <LinearGradient
          colors={['#0ea5e9', '#0284c7', '#0369a1']}
          style={styles.gradient}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <Ionicons name="fitness" size={80} color="#ffffff" />
              <Text style={styles.title}>FitTracker</Text>
              <Text style={styles.subtitle}>Your Journey to Better Health Starts Here</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.featureList}>
                <View style={styles.featureItem}>
                  <Ionicons name="footsteps" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Track Your Steps & Activities</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="bar-chart" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Monitor Your Progress</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="trophy" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Achieve Your Goals</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="people" size={24} color="#ffffff" />
                  <Text style={styles.featureText}>Share With Friends</Text>
                </View>
              </View>
            </View>

            <View style={styles.footer}>
              <Button
                title="Get Started"
                onPress={handleGetStarted}
                variant="primary"
                size="lg"
                textStyle={styles.primaryButtonText}
                style={styles.primaryButton}
              />
              <Button
                title="Sign In"
                onPress={handleSignIn}
                variant="ghost"
                size="md"
                style={styles.secondaryButton}
                textStyle={styles.secondaryButtonText}
              />
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  title: {
    fontSize: 48,
    color: '#ffffff',
    marginTop: 20,
    textAlign: 'center',
    ...getFontStyle('bold'),
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2fe',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
    ...getFontStyle('regular'),
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  featureList: {
    paddingVertical: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  featureText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 16,
    ...getFontStyle('medium'),
  },
  footer: {
    paddingBottom: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  secondaryButtonText: {
    color: '#ffffff',
  },
  primaryButtonText: {
    color: '#0ea5e9',
  },
});

