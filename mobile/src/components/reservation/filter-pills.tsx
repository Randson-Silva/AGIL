import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export type FilterOption = 'Todas' | 'Pendente' | 'Aprovada' | 'Encerradas';

interface FilterPillsProps {
  options: FilterOption[];
  activeFilter: FilterOption;
  onChangeFilter: (filter: FilterOption) => void;
}

export function FilterPills({ options, activeFilter, onChangeFilter }: FilterPillsProps) {
  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 12, gap: 12 }}
      >
        {options.map((option) => {
          const isActive = activeFilter === option;
          return (
            <TouchableOpacity
              key={option}
              activeOpacity={0.7}
              onPress={() => onChangeFilter(option)}
              className={`px-4 py-2 rounded-full border ${
                isActive ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`font-medium text-sm ${
                  isActive ? 'text-white' : 'text-gray-600'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
