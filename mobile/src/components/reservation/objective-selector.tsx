import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  ObjectiveOption,
  RESERVATION_OBJECTIVES,
  ReservationObjective,
} from '../../utils/constants';

interface ObjectiveSelectorProps {
  selectedObjective: ReservationObjective;
  onSelectObjective: (objective: ReservationObjective) => void;
  options?: ObjectiveOption[];
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
  selectedObjective,
  onSelectObjective,
  options = RESERVATION_OBJECTIVES,
}) => {
  return (
    <View className="mb-5">
      <View className="flex-row flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selectedObjective === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.7}
              onPress={() => onSelectObjective(option.value)}
              className={`px-4 py-2 rounded-full border ${
                isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-600'}`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedObjective === 'AULA_PRATICA' && (
        <Text className="text-xs font-medium text-[#00623B] mt-2">
          Aulas práticas têm prioridade na aprovação
        </Text>
      )}
    </View>
  );
};
