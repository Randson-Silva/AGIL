import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(public)/login" />;
  }

  // Redireciona o TÉCNICO direto para o inventário
  if (user.perfil === 'TECNICO') {
    return <Redirect href="/(protected)/(tecnico)/inventory" />;
  }

  // PROFESSOR e ALUNO vão para o dashboard padrão
  return <Redirect href="/(protected)/dashboard" />;
}
