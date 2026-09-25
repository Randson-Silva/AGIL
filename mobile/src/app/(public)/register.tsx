import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { PasswordRules } from '../../components/auth/PasswordRules';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useRegister } from '../../hooks/useRegister';

export default function RegisterScreen() {
  const router = useRouter();
  const {
    firstName, setFirstName,
    lastName, setLastName,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    isLoading,
    handleRegister,
  } = useRegister();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-emerald-50/30"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>

        {/* Botão de Voltar e Header */}
        <View className="mt-8 mb-6 relative items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="absolute left-0 top-2 w-10 h-10 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm z-10"
          >
            <Feather name="arrow-left" size={20} color="#374151" />
          </TouchableOpacity>

          <View className="w-16 h-16 bg-[#00623B] rounded-full items-center justify-center mb-3">
            <MaterialCommunityIcons name="flask-outline" size={32} color="#FFF" />
          </View>
          <Text className="text-3xl font-extrabold text-gray-900 mb-1">AGIL</Text>
          <Text className="text-gray-500 text-xs text-center">
            Aplicativo de Gestão de Insumos e Laboratórios
          </Text>
        </View>

        {/* Card de Formulário */}
        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100">
          <View className="items-center mb-6">
            <Text className="text-xl font-bold text-gray-900">Informações Pessoais</Text>
            <Text className="text-gray-500 text-sm mt-1">Preencha os campos abaixo</Text>
          </View>

          <Input
            label="Nome"
            iconName="user"
            placeholder=""
            value={firstName}
            onChangeText={setFirstName}
          />

          <Input
            label="Sobrenome"
            iconName="user"
            placeholder=""
            value={lastName}
            onChangeText={setLastName}
          />

          <Input
            label="E-mail institucional"
            iconName="mail"
            placeholder=""
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Senha"
            iconName="lock"
            placeholder="********"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          {/* Regras Dinâmicas de Senha */}
          <PasswordRules password={password} />

          <Input
            label="Confirmar senha"
            iconName="lock"
            placeholder=""
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />

          <View className="mt-2">
            <Button title="Cadastrar" onPress={handleRegister} isLoading={isLoading} />
          </View>
        </View>

        {/* Rodapé de Segurança */}
        <View className="flex-row items-center justify-center mt-6 mb-4">
          <Feather name="shield" size={14} color="#00623B" />
          <Text className="text-gray-400 text-xs ml-2">Ambiente seguro • IFCE Campus Quixadá</Text>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
