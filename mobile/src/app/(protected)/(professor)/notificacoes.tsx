import React from 'react';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { BellIcon } from 'react-native-heroicons/outline';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../components/ui/Back-button';
import { NotificationHistoryCard } from '../../../components/notifications/notification-history-card';
import { useProfessorNotificacoes } from '../../../hooks/useProfessorNotificacoes';

export default function ProfessorNotificacoesScreen() {
  const {
    firstName,
    initials,
    notifications,
    isLoading,
    isRefreshing,
    handleRefresh,
  } = useProfessorNotificacoes();

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      {/* Cabeçalho */}
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Notificações"
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#00623B']}
            tintColor="#00623B"
          />
        }
      >
        {/* Botão Voltar */}
        <View className="px-6 mt-4 mb-3">
          <BackButton />
        </View>

        {isLoading && !isRefreshing ? (
          <View className="py-16 items-center justify-center">
            <ActivityIndicator size="large" color="#00623B" />
            <Text className="text-sm text-gray-400 mt-2">Carregando avisos...</Text>
          </View>
        ) : (
          <View className="px-6">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <NotificationHistoryCard key={item.id} item={item} />
              ))
            ) : (
              <View className="bg-white rounded-3xl p-8 items-center justify-center border border-gray-100 shadow-sm mt-4">
                <View className="w-12 h-12 rounded-full bg-emerald-50 items-center justify-center mb-3">
                  <BellIcon size={24} color="#00623B" />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">
                  Nenhuma notificação
                </Text>
                <Text className="text-sm text-gray-500 text-center">
                  Você não possui avisos de salas, materiais ou devoluções no momento.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </PageWrapper>
  );
}
