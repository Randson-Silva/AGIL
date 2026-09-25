import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

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
  const [containerWidth, setContainerWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const selectedIndex = CATEGORIES.findIndex((c) => c.id === selectedCategory);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: selectedIndex,
      useNativeDriver: true,
      bounciness: 2,
      speed: 12,
    }).start();
  }, [selectedIndex]);

  return (
    <View className="mb-6">
      <Text className="text-sm font-semibold mb-2 text-gray-500 tracking-wider">CATEGORIA</Text>

      <View
        className="flex-row bg-white rounded-full border border-gray-200 relative overflow-hidden h-[50px]"
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {containerWidth > 0 && (
          <Animated.View
            style={{
              position: 'absolute',
              width: containerWidth / 4,
              height: '100%',
              backgroundColor: 'green',
              borderRadius: 9999,
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1, 2, 3],
                    outputRange: [
                      0,
                      containerWidth / 4,
                      (containerWidth / 4) * 2,
                      (containerWidth / 4) * 3,
                    ],
                  }),
                },
              ],
            }}
          />
        )}

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.8}
              onPress={() => onSelect(cat.id)}
              className="flex-1 justify-center items-center z-10"
            >
              <Text
                className={`font-semibold text-[13px] ${isSelected ? 'text-white' : 'text-gray-500'}`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
