import { Stack } from 'expo-router';
import '../../global.css';

export default function PublicLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
