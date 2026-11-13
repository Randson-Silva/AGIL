import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ExclamationTriangleIcon,
  CalendarIcon,
  ClockIcon,
} from 'react-native-heroicons/outline';
import { PanelAlertItem } from './types';

interface NotificationAlertCardProps {
  item: PanelAlertItem;
}

export function NotificationAlertCard({ item }: NotificationAlertCardProps) {
  const renderIcon = () => {
    switch (item.variant) {
      case 'avaria':
        return <ExclamationTriangleIcon size={26} color="#DC2626" />;
      case 'estoque_baixo':
        return <ExclamationTriangleIcon size={26} color="#D97706" />;
      case 'reserva':
        return <CalendarIcon size={26} color="#0284C7" />;
      case 'material':
        return <ClockIcon size={26} color="#0284C7" />;
      default:
        return <ExclamationTriangleIcon size={26} color="#6B7280" />;
    }
  };

  const getBadgeStyles = () => {
    switch (item.variant) {
      case 'avaria':
        return {
          container: 'bg-red-50 border-red-200',
          text: 'text-red-500',
        };
      case 'estoque_baixo':
        return {
          container: 'bg-[#FEF3C7] border-[#FDE68A]',
          text: 'text-[#92400E]',
        };
      case 'reserva':
      case 'material':
        return {
          container: 'bg-sky-50 border-sky-200',
          text: 'text-sky-600',
        };
      default:
        return {
          container: 'bg-gray-100 border-gray-200',
          text: 'text-gray-600',
        };
    }
  };

  const badgeStyles = getBadgeStyles();
  const Container = item.onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={item.onPress ? 0.7 : 1}
      onPress={item.onPress}
      className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm flex-row items-start"
    >
      {/* Ícone à esquerda */}
      <View className="mt-0.5 mr-3">{renderIcon()}</View>

      {/* Conteúdo textual e tag */}
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-900 leading-snug mb-1">
          {item.title}
        </Text>
        <Text className="text-sm text-gray-500 leading-tight mb-3">
          {item.description}
        </Text>
        <View
          className={`self-start px-3 py-1 rounded-full border ${badgeStyles.container}`}
        >
          <Text className={`text-xs font-semibold ${badgeStyles.text}`}>
            {item.badgeLabel}
          </Text>
        </View>
      </View>
    </Container>
  );
}
