import { authService } from '@/services/authService';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

export function useRegister() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return Alert.alert('Atenção', 'Preencha todos os campos.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Atenção', 'As senhas não coincidem.');
    }

    if (
      !/[A-Z]/.test(password) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(password) ||
      password.length < 8
    ) {
      return Alert.alert('Atenção', 'A senha não atende a todos os requisitos de segurança.');
    }

    try {
      setIsLoading(true);

      const fullName = `${firstName.trim()} ${lastName.trim()}`;

      await authService.register(fullName, email, password);

      Alert.alert('Sucesso', 'Cadastro realizado com sucesso!', [
        { text: 'Fazer Login', onPress: () => router.replace('/(public)/login') },
      ]);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao realizar cadastro.';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleRegister,
  };
}
