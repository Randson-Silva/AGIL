import { Slot } from 'expo-router';
import { AuthProvider } from '../contexts/AuthContext';
import Toast from 'react-native-toast-message';
import '../global.css';

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
