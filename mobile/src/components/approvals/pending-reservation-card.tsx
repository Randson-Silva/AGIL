import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { ReservationItem } from '../../services/reservation.service';
import { OBJECTIVE_LABELS } from '../../utils/constants';
import { PriorityBadge } from './priority-badge';

interface PendingReservationCardProps {
  item: ReservationItem;
  isProcessing?: boolean;
  onApprove: (id: string) => void;
  onReject: (item: ReservationItem) => void;
}

function formatDateBr(isoDate: string): string {
  if (!isoDate) return '';
  const datePart = isoDate.split('T')[0];
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

function formatTimeRange(horarios: ReservationItem['horarios']): string {
  if (!horarios || horarios.length === 0) return '';
  const sorted = [...horarios].sort((a, b) =>
    a.hora_inicio.localeCompare(b.hora_inicio),
  );
  return `${sorted[0].hora_inicio} — ${sorted[sorted.length - 1].hora_fim}`;
}

export function PendingReservationCard({
  item,
  isProcessing = false,
  onApprove,
  onReject,
}: PendingReservationCardProps) {
  const isHighPriority =
    item.prioridade_maxima ?? item.objetivo === 'AULA_PRATICA';
  const roleLabel =
    item.professor?.perfil === 'ALUNO' ? 'Aluno' : 'Professor';
  const protocol = `R-${item.id.substring(0, 4).toUpperCase()}`;
  const objectiveLabel = OBJECTIVE_LABELS[item.objetivo] || item.objetivo;
  const dateFormatted = formatDateBr(item.data_reserva);
  const timeRange = formatTimeRange(item.horarios);

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-200/80 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 pr-3">
          <Text className="text-base font-bold text-gray-900">
            {item.professor?.nome || 'Solicitante'}
          </Text>
          <Text className="text-xs text-gray-500 mt-0.5">
            {roleLabel} · protocolo {protocol}
          </Text>
        </View>
        <PriorityBadge isHighPriority={isHighPriority} />
      </View>

      <View className="bg-[#F2F5F3] rounded-2xl p-4 my-4">
        <View className="flex-row justify-between">
          <View className="flex-1 pr-2">
            <Text className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
              LABORATÓRIO
            </Text>
            <Text className="text-xs font-medium text-gray-900">
              {item.local}
            </Text>
          </View>

          <View className="flex-1 pl-2">
            <Text className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
              DATA E HORA
            </Text>
            <Text className="text-xs font-medium text-gray-900">
              {dateFormatted}
              {timeRange ? ` · \n${timeRange}` : ''}
            </Text>
          </View>
        </View>

        <View className="mt-3">
          <Text className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
            FINALIDADE
          </Text>
          <Text className="text-xs font-medium text-gray-900">
            {objectiveLabel}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isProcessing}
          onPress={() => onReject(item)}
          className="flex-1 bg-[#F8FAF9] border border-gray-200 rounded-full py-3 items-center justify-center"
        >
          <Text className="text-gray-800 font-semibold text-xs">Rejeitar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={isProcessing}
          onPress={() => onApprove(item.id)}
          className="flex-1 bg-[#00623B] rounded-full py-3 items-center justify-center"
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text className="text-white font-semibold text-xs">Aprovar</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
