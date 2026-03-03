import { app as firebaseApp } from '@react-native-firebase/app';  // Named import

// No need to call app() or initialize manually - it auto-inits from google-services.json
// Export for use elsewhere
export { firebaseApp };

// Optional: Export other services
export { default as auth } from '@react-native-firebase/auth';
export { default as firestore } from '@react-native-firebase/firestore';
