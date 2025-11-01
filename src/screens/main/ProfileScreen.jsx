import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFontStyle } from '../../utils/fonts';
import { useUser } from '../../contexts/UserContext';
import Button from '../../components/Button';

export default function ProfileScreen() {
  const { user, signOut } = useUser();
  console.log('User data in ProfileScreen:', user);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user && (
        <View style={styles.userInfo}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>{user.name}</Text>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user.email}</Text>
          
          {user.joinedDate && (
            <>
              <Text style={styles.label}>Joined:</Text>
              <Text style={styles.value}>
                {new Date(user.joinedDate).toLocaleDateString()}
              </Text>
            </>
          )}
        </View>
      )}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    color: '#1e293b',
    marginBottom: 24,
    textAlign: 'center',
    ...getFontStyle('bold'),
  },
  userInfo: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 16,
    marginBottom: 4,
    ...getFontStyle('medium'),
  },
  value: {
    fontSize: 16,
    color: '#1e293b',
    ...getFontStyle('regular'),
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: 32,
  },
});

