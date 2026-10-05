import React from 'react';
import { View, Text } from 'react-native';
import { OBJECTIVE_LABELS } from '../../utils/constants';
import { OccupiedSlotDetail } from '../../services/reservation.service';

interface AvailabilitySlotCardProps {
  startTime: string;
  endTime: string;
  labName: string;
  occupation?: OccupiedSlotDetail;
}

export const AvailabilitySlotCard: React.FC<AvailabilitySlotCardProps> = ({
  startTime,
  endTime,
  labName,
  occupation,
}) => {
  const isOccupied = Boolean(occupation);
  const isPending = occupation?.status === 'PENDENTE';

  let cardContainerStyle = 'bg-white border-gray-200';
  let badgeContainerStyle = 'bg-[#E3F3EC] border border-[#00623B]/30';
  let badgeTextStyle = 'text-[#00623B]';
  let badgeLabel = 'Livre';

  if (isOccupied) {
    if (isPending) {
      cardContainerStyle = 'bg-amber-50/40 border-amber-200';
      badgeContainerStyle = 'bg-amber-100 border border-amber-300';
      badgeTextStyle = 'text-amber-800';
      badgeLabel = 'Pendente';
    } else {
      cardContainerStyle = 'bg-gray-100 border-gray-200 opacity-85';
      badgeContainerStyle = 'bg-gray-200 border border-gray-300';
      badgeTextStyle = 'text-gray-600';
      badgeLabel = 'Reservado';
    }
  }

  return (
    <View
      className={`rounded-3xl p-4 mb-3 border flex-row justify-between items-center shadow-sm ${cardContainerStyle}`}
    >
      <View className="flex-1 pr-3">
        <Text
          className={`text-base font-extrabold ${
            isOccupied && !isPending ? 'text-gray-500' : 'text-gray-900'
          }`}
        >
          {startTime} — {endTime}
        </Text>

        <Text className="text-xs text-gray-500 mt-0.5">{labName}</Text>

        {occupation && (
          <Text className="text-xs font-medium text-gray-600 mt-1.5">
            {OBJECTIVE_LABELS[occupation.objetivo] || occupation.objetivo} · Prof.{' '}
            {occupation.professor_nome}
          </Text>
        )}
      </View>

      <View className={`px-3.5 py-1.5 rounded-full ${badgeContainerStyle}`}>
        <Text className={`text-xs font-bold ${badgeTextStyle}`}>{badgeLabel}</Text>
      </View>
    </View>
  );
};
