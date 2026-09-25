import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { RoleSelector } from '@/components/auth/RoleSelect';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '../../hooks/useLogin';

export default function LoginScreen() {
  const {
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
  } = useLogin();

  return (
    <KeyboardAvoidingView className="flex-1 bg-emerald-50/30">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
        {/* Cabeçalho */}
        <View className="items-center mb-8 mt-6">
          <View className="w-16 h-16 bg-[#00623B] rounded-full items-center justify-center mb-3">
            <MaterialCommunityIcons name="flask-outline" size={32} color="#FFF" />
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 mb-1">AGIL</Text>
          <Text className="text-gray-500 text-sm">
            Aplicativo de Gestão de Insumos e Laboratórios
          </Text>
        </View>

        {/* Card Principal */}
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <View className="items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Entrar</Text>
            <Text className="text-gray-500 text-sm mt-1">Entre com suas credenciais do IFCE</Text>
          </View>

          {/* Componentes Reutilizáveis */}
          <Input
            label="E-mail institucional"
            iconName="mail"
            placeholder="nome@ifce.edu.br"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            iconName="lock"
            placeholder="********"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            isPassword
          />

          <TouchableOpacity className="mb-6 ml-1">
            <Text className="text-[#00623B] font-medium text-sm">Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <RoleSelector selectedRole={profile} onSelectRole={setProfile} />

          <Button title="Entrar" onPress={handleLogin} isLoading={isLoading} />

          {/* Divisor "ou" */}
          <View className="flex-row items-center mb-4">
            <View className="flex-1 h-[1px] bg-gray-200" />
            <Text className="mx-4 text-gray-400 text-sm">ou</Text>
            <View className="flex-1 h-[1px] bg-gray-200" />
          </View>

          <Button
            title="Entrar com Google Institucional"
            variant="outline"
            onPress={handleGoogleLogin}
            icon={<MaterialCommunityIcons name="google" size={20} color="#DB4437" />}
          />

          {/* Cadastre-se */}
          <View className="flex-row justify-center mt-2">
            <Text className="text-gray-500 text-sm">Ainda não possui cadastro? </Text>
            <TouchableOpacity onPress={handlePressRegister}>
              <Text className="text-[#00623B] text-sm font-semibold">Cadastre-se aqui</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Rodapé Rodapé de Segurança */}
        <View className="flex-row items-center justify-center mt-6">
          <Feather name="shield" size={14} color="#00623B" />
          <Text className="text-gray-400 text-xs ml-2">Ambiente seguro • IFCE Campus Quixadá</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
