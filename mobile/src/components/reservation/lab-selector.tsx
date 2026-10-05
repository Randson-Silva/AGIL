import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LABORATORIES } from '../../utils/constants';

interface LabSelectorProps {
  selectedLab: string;
  onSelectLab: (labName: string) => void;
}

export const LabSelector: React.FC<LabSelectorProps> = ({ selectedLab, onSelectLab }) => {
  return (
    <View className="mb-5">
      <Text className="text-sm font-bold text-gray-800 mb-2">Laboratórios</Text>

      <View className="gap-3">
        {LABORATORIES.map((lab) => {
          const isSelected = selectedLab === lab.name;

          return (
            <TouchableOpacity
              key={lab.id}
              activeOpacity={0.7}
              onPress={() => onSelectLab(lab.name)}
              className={`flex-row justify-between items-center p-4 rounded-2xl border ${
                isSelected ? 'bg-[#E3F3EC] border-[#00623B]' : 'bg-white border-gray-200'
              }`}
            >
              <View>
                <Text className="text-base font-bold text-gray-900">{lab.name}</Text>
                <Text className="text-xs text-gray-500 mt-0.5">{lab.location}</Text>
              </View>

              <Text className="text-xs font-medium text-gray-500">{lab.capacity} Lugares</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
