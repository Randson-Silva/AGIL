import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export type CategoryType = 'REAGENTE' | 'SOLUCAO' | 'VIDRARIA' | 'EQUIPAMENTO';

interface CategorySelectorProps {
  selectedCategory: string;
  onSelect: (category: CategoryType) => void;
  label?: string;
}

const CATEGORIES: { id: CategoryType; label: string }[] = [
  { id: 'REAGENTE', label: 'Reagente' },
  { id: 'SOLUCAO', label: 'Solução' },
  { id: 'VIDRARIA', label: 'Vidraria' },
  { id: 'EQUIPAMENTO', label: 'Equipamento' },
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategory,
  onSelect,
  label = 'Tipo de ocorrência',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel = CATEGORIES.find((c) => c.id === selectedCategory)?.label || 'Reagente';

  const handleSelect = (categoryId: CategoryType) => {
    onSelect(categoryId);
    setIsOpen(false);
  };

  return (
    <View className="mb-5 z-50" style={{ zIndex: 50, elevation: isOpen ? 50 : 0 }}>
      {label ? <Text className="text-base font-bold text-gray-900 mb-2.5">{label}</Text> : null}

      <View className="relative self-start min-w-[175px]">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setIsOpen((prev) => !prev)}
          className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex-row items-center justify-center relative shadow-sm"
        >
          <View className="absolute left-3.5">
            <Feather name="chevron-down" size={18} color="#4B5563" />
          </View>
          <Text className="text-base font-bold text-[#111827] ml-4">{selectedLabel}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View
            className="absolute top-0 left-0 right-0 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg"
            style={{ zIndex: 100, elevation: 12 }}
          >
            {CATEGORIES.map((cat, index) => {
              const isFirst = index === 0;
              const isLast = index === CATEGORIES.length - 1;

              return (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  onPress={() => handleSelect(cat.id)}
                  className={`px-4 py-3 flex-row items-center justify-center relative bg-white ${
                    !isLast ? 'border-b border-gray-200' : ''
                  }`}
                >
                  {isFirst && (
                    <View className="absolute left-3.5">
                      <Feather name="chevron-down" size={18} color="#4B5563" />
                    </View>
                  )}
                  <Text className={`text-base font-bold text-[#111827] ${isFirst ? 'ml-4' : ''}`}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};
