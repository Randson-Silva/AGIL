import React from 'react';
import {
  ScrollView,
  Text,
  View,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { BackButton } from '../../../components/ui/Back-button';
import { NotificationAlertCard } from '../../../components/notifications/notification-alert-card';
import { NotificationHistoryCard } from '../../../components/notifications/notification-history-card';
import { useNotificacoes } from '../../../hooks/useNotificacoes';

export default function NotificacoesScreen() {
  const {
    firstName,
    initials,
    panelAlerts,
    historyNotifications,
    isLoading,
    isRefreshing,
    handleRefresh,
  } = useNotificacoes();

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
        <View className="px-6 mt-4 mb-2">
          <BackButton />
        </View>

        {isLoading && !isRefreshing ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#00623B" />
            <Text className="text-sm text-gray-400 mt-2">Carregando avisos...</Text>
          </View>
        ) : (
          <>
            {/* Seção 1: Alertas do painel */}
            <View className="px-6 mt-4 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Alertas do painel
              </Text>
              {panelAlerts.length > 0 ? (
                panelAlerts.map((alert) => (
                  <NotificationAlertCard key={alert.id} item={alert} />
                ))
              ) : (
                <Text className="text-gray-400 text-sm">
                  Nenhum alerta pendente no momento.
                </Text>
              )}
            </View>

            {/* Seção 2: Histórico */}
            <View className="px-6 mb-6">
              <Text className="text-xl font-bold text-gray-900 mb-4">
                Histórico
              </Text>
              {historyNotifications.length > 0 ? (
                historyNotifications.map((historyItem) => (
                  <NotificationHistoryCard
                    key={historyItem.id}
                    item={historyItem}
                  />
                ))
              ) : (
                <Text className="text-gray-400 text-sm">
                  Nenhum histórico registrado no momento.
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </PageWrapper>
  );
}
