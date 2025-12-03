import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export class AuthService {
  static async signUp(email, password, displayName) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await updateProfile(user, { displayName });
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
      };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    } catch (error) {
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  static async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw new Error('Failed to sign out');
    }
  }

  static async signInWithGoogle() {
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      throw new Error('Google Client ID is not configured. Please set EXPO_PUBLIC_GOOGLE_CLIENT_ID in your environment variables.');
    }

    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'fitness-tracker',
      path: 'redirect',
    });

    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Code,
      redirectUri: redirectUri,
      usePKCE: true,
      additionalParameters: {},
    });

    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };

    const result = await request.promptAsync(discovery, {
      useProxy: true,
    });

    if (result.type !== 'success') {
      if (result.type === 'cancel') {
        throw new Error('Google sign-in was cancelled');
      }
      if (result.type === 'error') {
        const errorMessage = result.error?.message || result.error?.errorDescription || 'Unknown error';
        throw new Error(`Google sign-in error: ${errorMessage}`);
      }
      throw new Error('Google sign-in failed. Please try again.');
    }

    const { code } = result.params;
    
    if (!code) {
      throw new Error('Authorization code not received from Google. Please try again.');
    }

    const tokenResponse = await request.exchangeCodeAsync(
      {
        clientId: clientId,
        code: code,
        redirectUri: redirectUri,
        extraParams: {},
      },
      discovery
    );

    const id_token = tokenResponse.idToken;
    
    if (!id_token) {
      throw new Error('ID token not received from Google. Please try again.');
    }

    const googleCredential = GoogleAuthProvider.credential(id_token);
    
    if (!googleCredential) {
      throw new Error('Failed to create Google credential. Please try again.');
    }
    
    const userCredential = await signInWithCredential(auth, googleCredential);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    };
  }

  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
        });
      } else {
        callback(null);
      }
    });
  }

  static getCurrentUser() {
    const user = auth.currentUser;
    if (user) {
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      };
    }
    return null;
  }

  static getAuthErrorMessage(errorCode) {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with the same email address but different sign-in credentials.';
      case 'auth/invalid-verification-code':
        return 'The verification code is invalid.';
      case 'auth/invalid-verification-id':
        return 'The verification ID is invalid.';
      case 'auth/network-request-failed':
        return 'A network error occurred. Please check your internet connection.';
      case 'auth/popup-closed-by-user':
        return 'The popup was closed before authentication completed.';
      case 'auth/unauthorized-domain':
        return 'This domain is not authorized for OAuth operations.';
      default:
        return errorCode ? `Authentication error: ${errorCode}` : 'An error occurred during authentication.';
    }
  }
}

