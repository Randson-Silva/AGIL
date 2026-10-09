import React from 'react';
import { View, Text } from 'react-native';

interface RequestHistoryCardProps {
  item: any;
}

export function RequestHistoryCard({ item }: RequestHistoryCardProps) {
  let badgeConfig = { bg: 'bg-gray-100', text: 'text-gray-600', label: item.status };

  if (item.status === 'APROVADA') {
    badgeConfig = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprovada' };
  } else if (item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES') {
    badgeConfig = { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendente' };
  } else if (item.status === 'REJEITADA') {
    badgeConfig = { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejeitada' };
  } else if (item.status === 'CANCELADA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Cancelada' };
  } else if (item.status === 'DEVOLVIDO' || item.status === 'CONCLUIDA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Devolvido' };
  }

  const formatDateTime = (iso: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return iso;
    }
  };

  const devolucaoStr = item.data_devolucao 
    ? `Devolução ${formatDateTime(item.data_devolucao)}` 
    : 'Sem devolução';

  const itemsCount = item.itens ? item.itens.length : 0;
  const itemsLabel = itemsCount === 1 ? '1 item' : `${itemsCount} itens`;

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm mx-6 flex-row justify-between items-center">
      <View>
        <Text className="text-gray-900 font-bold text-base mb-1">
          {item.id ? `S-${item.id.substring(0, 4).toUpperCase()}` : 'S-000'}
        </Text>
        <Text className="text-gray-500 text-sm">
          {itemsLabel} · {devolucaoStr}
        </Text>
      </View>

      <View className={`${badgeConfig.bg} px-3 py-1 rounded-full`}>
        <Text className={`${badgeConfig.text} font-medium text-xs`}>{badgeConfig.label}</Text>
      </View>
    </View>
  );
}
