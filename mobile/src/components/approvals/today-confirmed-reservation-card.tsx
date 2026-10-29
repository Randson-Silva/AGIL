import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ReservationItem } from '../../services/reservation.service';
import { OBJECTIVE_LABELS } from '../../utils/constants';

interface TodayConfirmedReservationCardProps {
  item: ReservationItem;
  isProcessing?: boolean;
  onRegisterAbsence: (id: string) => void;
}

function formatTimeRange(horarios: ReservationItem['horarios']): string {
  if (!horarios || horarios.length === 0) return '';
  const sorted = [...horarios].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio),
  );
  return `${sorted[0].hora_inicio} - ${sorted[sorted.length - 1].hora_fim}`;
}

export function TodayConfirmedReservationCard({
  item,
  isProcessing = false,
  onRegisterAbsence,
}: TodayConfirmedReservationCardProps) {
  const protocol = `R-${item.id.substring(0, 4).toUpperCase()}`;
  const objectiveLabel = OBJECTIVE_LABELS[item.objetivo] || item.objetivo;
  const timeRange = formatTimeRange(item.horarios);

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-200/80 shadow-sm">
      <Text className="text-base font-bold text-gray-900 mb-1">
        {item.professor?.nome || 'Solicitante'}
      </Text>
      <Text className="text-xs text-gray-500 mb-0.5">{item.local}</Text>
      {Boolean(timeRange) && (
        <Text className="text-xs text-gray-500 mb-0.5">{timeRange}</Text>
      )}
      <Text className="text-xs text-gray-500 mb-4">
        {objectiveLabel} · protocolo {protocol}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={isProcessing}
        onPress={() => onRegisterAbsence(item.id)}
        className="bg-[#F4F6F5] border border-gray-200 rounded-full py-3 items-center justify-center"
      >
        {isProcessing ? (
          <ActivityIndicator size="small" color="#374151" />
        ) : (
          <Text className="text-gray-800 font-semibold text-xs">
            Registrar ausência
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
