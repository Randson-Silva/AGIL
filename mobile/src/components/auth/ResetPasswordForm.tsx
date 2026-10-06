import { useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { authService } from '../../services/authService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface ResetPasswordFormProps {
  email: string;
  code: string;
  onSuccess: () => void;
}

export function ResetPasswordForm({ email, code, onSuccess }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleResetPassword() {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Toast.show({ type: 'error', text1: 'Preencha todos os campos' });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'As senhas não coincidem' });
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(email, code, newPassword);
      Toast.show({ type: 'success', text1: 'Senha alterada com sucesso!' });
      onSuccess();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Falha na redefinição',
        text2: error.response?.data?.message || 'Erro ao redefinir senha.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="w-full">
      <View className="items-center mb-6">
        <Text className="text-xl font-bold text-gray-900">Criar Nova Senha</Text>
        <Text className="text-gray-500 text-sm mt-1 text-center px-2 leading-relaxed">
          Digite a sua nova senha e confirme abaixo para concluir a alteração.
        </Text>
      </View>

      <View className="gap-2">
        <Input
          label="Nova Senha"
          iconName="lock"
          placeholder="Sua nova senha"
          isPassword={true}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <Input
          label="Confirmar Nova Senha"
          iconName="lock"
          placeholder="Repita a nova senha"
          isPassword={true}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <View className="mt-2">
          <Button title="Redefinir Senha" onPress={handleResetPassword} isLoading={loading} />
        </View>
      </View>
    </View>
  );
}
