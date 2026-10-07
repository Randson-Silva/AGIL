import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReservationCardProps {
  item: any;
  onCancelPress?: (item: any) => void;
}

export function ReservationCard({ item, onCancelPress }: ReservationCardProps) {
  // Configuração do Status Badge
  let badgeConfig = { bg: 'bg-gray-100', text: 'text-gray-600', label: item.status };

  if (item.status === 'APROVADA') {
    badgeConfig = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprovada' };
  } else if (item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES') {
    badgeConfig = { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendente' };
  } else if (item.status === 'REJEITADA') {
    badgeConfig = { bg: 'bg-red-100', text: 'text-red-800', label: 'Ausente/Rejeitada' };
  } else if (item.status === 'CANCELADA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Cancelada' };
  }

  // Formatador de Data e Horário
  const formatDateTime = () => {
    try {
      const d = new Date(item.data_reserva);
      if (isNaN(d.getTime())) return item.data_reserva;
      
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      
      let timeString = '';
      if (item.horarios && item.horarios.length > 0) {
        const start = item.horarios[0].hora_inicio;
        const end = item.horarios[item.horarios.length - 1].hora_fim;
        timeString = ` · ${start} — ${end}`;
      }
      
      return `${day}/${month}/${year}${timeString}`;
    } catch {
      return item.data_reserva;
    }
  };

  const protocolo = item.id ? `R-${item.id.substring(0, 4).toUpperCase()}` : 'R-1000';
  const showCancelButton = (item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES' || item.status === 'APROVADA');

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm mx-6">
      {/* Header do Card */}
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-gray-900 font-bold text-base flex-1 mr-2">{item.local}</Text>
        <View className={`${badgeConfig.bg} px-3 py-1 rounded-full`}>
          <Text className={`${badgeConfig.text} font-medium text-xs`}>{badgeConfig.label}</Text>
        </View>
      </View>

      {/* Data e Hora */}
      <Text className="text-gray-500 text-sm mb-3">{formatDateTime()}</Text>

      {/* Descrição */}
      <Text className="text-gray-600 text-sm mb-4">
        {item.objetivo} — {item.titulo} · protocolo {protocolo}
      </Text>

      {/* Box de Ausência (Mock baseado na imagem) */}
      {item.status === 'REJEITADA' && (
        <View className="bg-red-50 p-3 rounded-xl mb-4">
          <Text className="text-red-600 text-xs">
            Ausência registrada. Novas reservas ficam bloqueadas temporariamente.
          </Text>
        </View>
      )}

      {/* Botão Cancelar */}
      {showCancelButton && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onCancelPress && onCancelPress(item)}
          className="bg-[#F8FAF9] border border-gray-200 py-3 rounded-xl items-center"
        >
          <Text className="text-gray-800 font-semibold text-sm">Cancelar reserva</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
