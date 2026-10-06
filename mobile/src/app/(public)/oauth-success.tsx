import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function OAuthSuccessScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { signInWithToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      if (token) {
        try {
          await signInWithToken(token);

          router.replace('/(protected)/dashboard');
        } catch (error) {
          console.error('Erro ao processar login OAuth:', error);
          router.replace('/(public)/login');
        }
      } else {
        router.replace('/(public)/login');
      }
    }

    handleAuth();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#00623B" />
    </View>
  );
}
