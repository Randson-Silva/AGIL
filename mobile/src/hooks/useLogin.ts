import { RoleType } from '@/components/auth/RoleSelect';
import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './useAuth';

export function useLogin() {
  const { signIn, signInWithToken } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profile, setProfile] = useState<RoleType>('ALUNO');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Atenção', 'Preencha o e-mail e a senha.');
    }

    try {
      setIsLoading(true);
      await signIn({ email, password, profile });
      router.replace('/');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro no Login', 'Verifique suas credenciais e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressRegister = () => {
    router.navigate('/(public)/register');
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const token = await authService.loginWithGoogle();

      await signInWithToken(token);
      router.replace('/');
    } catch (error) {
      console.error('Falha no login com Google:', error);
      Alert.alert('Erro', 'Não foi possível autenticar com a conta Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    profile,
    setProfile,
    isLoading,
    handleLogin,
    handleGoogleLogin,
    handlePressRegister,
  };
}
