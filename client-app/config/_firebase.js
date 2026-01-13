import app from '@react-native-firebase/app';

// This ensures Firebase is initialized
// @react-native-firebase/app auto-initializes from google-services.json
// We just need to import it before anything else

export const firebaseApp = app();

export default firebaseApp;