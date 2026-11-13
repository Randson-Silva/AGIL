import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  XCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  InformationCircleIcon,
  CalendarIcon,
} from 'react-native-heroicons/outline';
import { HistoryNotificationItem } from './types';

interface NotificationHistoryCardProps {
  item: HistoryNotificationItem;
}

export function NotificationHistoryCard({ item }: NotificationHistoryCardProps) {
  const renderIcon = () => {
    switch (item.type) {
      case 'AUSENCIA':
      case 'REJEITADA':
        return <XCircleIcon size={24} color="#DC2626" />;
      case 'APROVADA':
        return <CheckCircleIcon size={24} color="#059669" />;
      case 'PRAZO_DEVOLUCAO':
        return <ClockIcon size={24} color="#D97706" />;
      case 'MATERIAL_PENDENTE':
        return <InformationCircleIcon size={24} color="#0284C7" />;
      case 'RESERVA_PENDENTE':
        return <CalendarIcon size={24} color="#0284C7" />;
      default:
        return <CheckCircleIcon size={24} color="#6B7280" />;
    }
  };

  const Container = item.onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={item.onPress ? 0.7 : 1}
      onPress={item.onPress}
      className="bg-white rounded-3xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center"
    >
      {/* Ícone à esquerda */}
      <View className="mr-3">{renderIcon()}</View>

      {/* Conteúdo textual */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-base font-bold text-gray-900 leading-snug">
            {item.title}
          </Text>
          <Text className="text-xs text-gray-400 font-medium">
            {item.timestamp}
          </Text>
        </View>
        <Text className="text-sm text-gray-500 leading-tight" numberOfLines={2}>
          {item.subtitle}
        </Text>
      </View>
    </Container>
  );
}
