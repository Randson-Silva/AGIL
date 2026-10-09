import { useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/authService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface RequestCodeFormProps {
  onSuccess: (email: string) => void;
}

export function RequestCodeForm({ onSuccess }: RequestCodeFormProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!email.trim()) {
      Toast.show({ type: 'error', text1: 'Informe o seu e-mail institucional.' });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(email.trim());
      Toast.show({
        type: 'info',
        text1: 'Verifique o seu e-mail',
        text2: response?.message || 'Se o e-mail estiver cadastrado, receberá o código.',
      });
      onSuccess(email.trim());
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro de conexão',
        text2: 'Não foi possível processar a solicitação.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="w-full">
      {/* Título e Subtítulo da Etapa 1 */}
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-900">Redefinir Senha</Text>
        <Text className="text-gray-500 text-sm mt-1 text-center px-2 leading-relaxed">
          Informe o e-mail associado a sua conta para receber um código de recuperação.
        </Text>
      </View>

      <View className="gap-2">
        <Input
          label="E-mail institucional"
          iconName="mail"
          placeholder="nome@ifce.edu.br"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Button title="Enviar Código" onPress={handleSendCode} isLoading={loading} />
      </View>
    </View>
  );
}
