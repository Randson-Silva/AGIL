import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import { PageWrapper } from '../../components/ui/page-wrapper';

export default function DashboardScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  return (
    <PageWrapper className="bg-[#F4F7F4] p-5">
      <View className="flex-row justify-between items-center mt-2 mb-8">
        <View>
          <Text className="text-sm text-gray-500">Bem-vindo(a),</Text>
          <Text className="text-2xl font-bold text-gray-900">
            {user?.name || 'Utilizador'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={signOut}
          className="p-3 bg-white rounded-full border border-gray-200"
        >
          <Feather name="log-out" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      {user?.profile === 'PROFESSOR' && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/(protected)/(professor)/new-reservation')}
          className="bg-[#00623B] p-5 rounded-2xl flex-row items-center justify-between shadow-sm mb-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Feather name="calendar" size={20} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-white font-bold text-base">
                Nova Reserva de Laboratório
              </Text>
              <Text className="text-emerald-100 text-xs mt-0.5">
                Agendar aulas práticas, projetos ou pesquisas
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </PageWrapper>
  );
}