import { Slot } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import Toast from 'react-native-toast-message';
import { AuthProvider } from '../contexts/AuthContext';
import '../global.css';

WebBrowser.maybeCompleteAuthSession();

export default function RootLayout() {
  return (
    <>
      <AuthProvider>
        <Slot />
      </AuthProvider>
      <Toast />
    </>
  );
}
