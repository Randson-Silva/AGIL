import React from 'react';
import { Text, View } from 'react-native';

interface PriorityBadgeProps {
  isHighPriority: boolean;
}

export function PriorityBadge({ isHighPriority }: PriorityBadgeProps) {
  return (
    <View
      className={`px-3 py-1 rounded-full border ${
        isHighPriority
          ? 'bg-[#DCFCE7] border-[#86EFAC]'
          : 'bg-[#F3F4F6] border-gray-300'
      }`}
    >
      <Text
        className={`text-xs font-medium ${
          isHighPriority ? 'text-[#00623B]' : 'text-gray-600'
        }`}
      >
        {isHighPriority ? 'Prioridade alta' : 'Prioridade baixa'}
      </Text>
    </View>
  );
}
