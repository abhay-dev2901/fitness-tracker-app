# 💪 Fitness Tracker App

A comprehensive, real-time fitness tracking mobile application built with React Native and Expo. Track your steps, workouts, calories, and water intake with beautiful UI and seamless Firebase integration.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-~54.0.20-black)
![Firebase](https://img.shields.io/badge/Firebase-12.4.0-orange)
![License](https://img.shields.io/badge/License-Private-red)

## 📱 Features

### 🔐 Authentication
- **Email/Password Authentication** - Secure sign up and login
- **Google Sign-In** - One-tap authentication with Google
- **Password Recovery** - Forgot password functionality
- **Persistent Sessions** - Stay logged in across app restarts
- **Onboarding Flow** - Smooth first-time user experience

### 🏃 Activity Tracking
- **Step Counter** - Real-time step tracking with auto-increment
- **Distance Calculation** - Automatic distance calculation from steps
- **Calorie Tracking** - Monitor calories burned throughout the day
- **Water Intake Tracker** - Track daily water consumption with quick add buttons
- **Workout Logging** - Log workouts with type, duration, and calories
- **Activity Overview** - Comprehensive dashboard showing all activities

### 📊 Progress & Analytics
- **Real-Time Progress Tracking** - Live updates as you exercise
- **Weekly & Monthly Views** - Switch between time periods
- **Visual Charts** - Beautiful bar charts for steps, calories, and workouts
- **Summary Statistics** - Total, average, and best day metrics
- **Trend Analysis** - See if you're improving or declining
- **Streak Tracking** - Track consecutive days of activity
- **Distance Tracking** - Total distance covered

### 🏆 Social Features
- **Leaderboard** - Compete with other users
- **Multiple Metrics** - Leaderboards for steps, calories, and workouts
- **Your Rank** - See where you stand among all users
- **Real-Time Rankings** - Updated leaderboard with pull-to-refresh

### 🏠 Home Dashboard
- **Today's Progress** - Quick view of all daily goals
- **Progress Bars** - Visual representation of goal completion
- **Weekly Steps Chart** - Line chart showing 7-day step trend
- **Quick Actions** - Fast access to log workouts, add water, and track steps
- **Achievements** - Unlock achievements based on your activity
- **Real-Time Updates** - Live data synchronization

### 👤 Profile Management
- **User Profile** - Manage your personal information
- **Fitness Goals** - Set and track your fitness objectives
- **Activity Level** - Configure your activity preferences

## 🛠️ Tech Stack

### Frontend
- **React Native** (0.81.5) - Cross-platform mobile framework
- **Expo** (~54.0.20) - Development platform and tooling
- **React Navigation** (v7) - Navigation library
- **React Native Chart Kit** - Beautiful charts and graphs

### Backend & Services
- **Firebase Authentication** - User authentication
- **Cloud Firestore** - Real-time database
- **Firebase Security Rules** - Secure data access

### UI/UX
- **Expo Vector Icons** - Icon library
- **Custom Fonts** - Poppins font family
- **Safe Area Context** - Proper screen insets handling

### State Management
- **React Context API** - Global state management
- **AsyncStorage** - Local data persistence

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Expo CLI** (`npm install -g expo-cli`)
- **Firebase Account** - For backend services
- **Google Account** - For Google Sign-In (optional)
- **iOS Simulator** (for Mac) or **Android Emulator** (for Android development)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fitness-tracker
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

#### Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" and follow the setup wizard
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password**
   - Enable **Google** (for Google Sign-In)
4. Create a **Firestore Database**:
   - Go to Firestore Database
   - Click "Create Database"
   - Start in **test mode** (we'll update rules later)

#### Get Firebase Configuration

1. Go to Project Settings → General
2. Scroll down to "Your apps"
3. Click the web icon (`</>`) to add a web app
4. Copy the Firebase configuration object

#### Configure Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

**Note:** For Google Sign-In, you need to:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URIs:
   - `fitness-tracker://` (for mobile)
   - Your Expo development URL

### 4. Update Firebase Configuration

Edit `src/config/firebase.js` and replace the configuration with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};
```

### 5. Configure Firestore Security Rules

Go to Firestore Database → Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Fitness data collection
    match /fitness_data/{documentId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      
      allow write: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
    }
    
    // Workouts collection
    match /workouts/{workoutId} {
      allow read: if request.auth != null && 
        request.auth.uid == resource.data.uid;
      
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
      
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.uid;
    }
  }
}
```

**Important:** Click "Publish" to save the rules.

### 6. Configure App.json

The `app.json` file should already have the URL scheme configured:

```json
{
  "expo": {
    "scheme": "fitness-tracker"
  }
}
```

This enables OAuth redirects for Google Sign-In.

## 🏃 Running the App

### Development Mode

```bash
# Start the Expo development server
npm start
# or
yarn start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

### Platform-Specific Commands

```bash
# iOS
npm run ios
# or
yarn ios

# Android
npm run android
# or
yarn android

# Web
npm run web
# or
yarn web
```

## 📁 Project Structure

```
fitness-tracker/
├── assets/                 # Images and static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   └── Button.jsx
│   ├── config/            # Configuration files
│   │   └── firebase.js    # Firebase initialization
│   ├── contexts/           # React Context providers
│   │   └── UserContext.jsx # User authentication context
│   ├── navigation/         # Navigation configuration
│   │   ├── AuthNavigator.jsx
│   │   ├── MainNavigator.jsx
│   │   └── RootNavigator.jsx
│   ├── screens/           # Screen components
│   │   ├── activity/      # Activity tracking screens
│   │   ├── auth/          # Authentication screens
│   │   └── main/          # Main app screens
│   ├── services/          # Business logic services
│   │   ├── authService.js      # Authentication service
│   │   └── firestoreService.js # Firestore operations
│   └── utils/             # Utility functions
│       └── fonts.js       # Font configuration
├── App.jsx                # Root component
├── app.json              # Expo configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## 🎯 Key Features Explained

### Real-Time Data Synchronization

The app uses Firestore's real-time listeners (`onSnapshot`) to automatically update the UI when data changes. This means:
- No manual refresh needed
- Instant updates across all screens
- Automatic synchronization between devices

### Activity Tracking

**Step Counter:**
- Auto-increment every 2 seconds when tracking is active
- Automatic save every 10 seconds
- Distance and calorie calculations
- Daily goal tracking

**Workout Logging:**
- Multiple workout types (Cardio, Strength, Flexibility, Sports, Other)
- Duration and calorie tracking
- Individual workout entries stored in Firestore
- Daily workout count aggregation

**Water & Calorie Tracking:**
- Quick add buttons for common amounts
- Progress bars showing goal completion
- Daily totals with persistence

### Progress Analytics

**Time Periods:**
- Week view: Last 7 days
- Month view: Last 30 days

**Metrics:**
- Total steps, calories, workouts, water
- Daily averages
- Best day identification
- Current streak tracking
- Total distance covered
- Trend analysis (up/down indicators)

### Social Features

**Leaderboard:**
- Top 20 users ranked by selected metric
- Real-time updates
- Your rank display
- Multiple leaderboards (steps, calories, workouts)

## 🔧 Configuration

### Customizing Goals

Default daily goals can be modified in:
- `src/screens/main/HomeScreen.jsx` - Home screen goals
- `src/screens/activity/StepCounterScreen.jsx` - Step goal
- `src/screens/activity/CalorieTrackerScreen.jsx` - Calorie goal
- `src/screens/activity/WaterTrackerScreen.jsx` - Water goal

### Font Configuration

Fonts are configured in `src/utils/fonts.js` using Poppins. To change fonts:
1. Install new font package
2. Update `getFontStyle` function
3. Modify font weights as needed

## 🐛 Troubleshooting

### Firebase Connection Issues

**Error: "Firebase: Error (auth/network-request-failed)"**
- Check your internet connection
- Verify Firebase configuration in `.env`
- Ensure Firebase project is active

**Error: "Missing or insufficient permissions"**
- Update Firestore security rules (see step 5 in Installation)
- Ensure rules are published
- Check that user is authenticated

### Google Sign-In Issues

**Error: "Google Client ID is not configured"**
- Verify `EXPO_PUBLIC_GOOGLE_CLIENT_ID` in `.env`
- Restart Expo server after adding environment variables
- Check OAuth redirect URIs in Google Cloud Console

**Error: "OAuth 2.0 policy compliance"**
- Ensure using Authorization Code flow (already implemented)
- Verify redirect URI matches `fitness-tracker://`

### App Crashes

**"Cannot read property of null"**
- Clear app data and restart
- Reinstall node_modules: `rm -rf node_modules && npm install`
- Clear Expo cache: `expo start -c`

### Real-Time Updates Not Working

- Check Firestore security rules allow read access
- Verify user is authenticated
- Check network connection
- Restart the app

## 📱 Platform Support

- ✅ iOS (via Expo)
- ✅ Android (via Expo)
- ⚠️ Web (limited functionality)

## 🔒 Security

- All authentication handled by Firebase
- Firestore security rules enforce data access
- User data isolated by UID
- No sensitive data stored locally
- Secure password hashing (Firebase)

## 🚧 Future Enhancements

Potential features for future versions:
- [ ] Social features (friends, challenges)
- [ ] Workout templates and plans
- [ ] Nutrition tracking
- [ ] Wearable device integration
- [ ] Push notifications
- [ ] Data export
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Advanced analytics and insights
- [ ] Custom workout routines

## 🤝 Contributing

This is a private project. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary. All rights reserved.

## 👨‍💻 Development

### Code Style

- Use functional components with hooks
- Follow React Native best practices
- Maintain consistent naming conventions
- Comment complex logic

### Testing

Before deploying:
- Test on both iOS and Android
- Verify all authentication flows
- Check real-time updates
- Test offline scenarios
- Validate Firestore rules

## 📞 Support

For issues or questions:
- Check the Troubleshooting section
- Review Firebase documentation
- Check Expo documentation
- Review React Navigation docs

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for development platform
- React Native community
- All open-source contributors

---

**Built with ❤️ using React Native and Firebase**

