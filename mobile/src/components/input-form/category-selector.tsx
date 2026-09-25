import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CATEGORIES = [
  { id: 'REAGENTE', label: 'Reagente' },
  { id: 'SOLUCAO', label: 'Solução' },
  { id: 'VIDRARIA', label: 'Vidraria' },
  { id: 'EQUIPAMENTO', label: 'Equipamento' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <View>
      <Text className="text-sm font-semibold mb-2 text-gray-600">CATEGORIA *</Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => onSelect(cat.id)}
              className={`px-4 py-2 rounded-full border ${
                isSelected ? 'bg-green-600 border-green-600' : 'bg-gray-100 border-gray-300'
              }`}
            >
              <Text className={isSelected ? 'text-white' : 'text-gray-700'}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
