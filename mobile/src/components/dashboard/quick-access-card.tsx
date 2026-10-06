import * as OutlineIcons from 'react-native-heroicons/outline';
import { Text, TouchableOpacity, View } from 'react-native';
import { QuickAccessItem } from './types';

interface QuickAccessCardProps {
  item: QuickAccessItem;
}

export function QuickAccessCard({ item }: QuickAccessCardProps) {
  const Icon = (OutlineIcons as any)[item.iconName];

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={item.onPress}
      className="bg-white rounded-3xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center w-[48%]"
    >
      <View className="mr-3">
        {Icon && <Icon size={24} color="#00623B" />}
      </View>
      <Text className="text-gray-900 font-semibold text-sm flex-1 leading-tight">
        {item.label}
      </Text>
    </TouchableOpacity>
  );
}
