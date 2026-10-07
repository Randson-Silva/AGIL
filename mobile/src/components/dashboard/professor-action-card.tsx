import * as OutlineIcons from 'react-native-heroicons/outline';
import { Text, TouchableOpacity, View } from 'react-native';

export interface ProfessorActionItem {
  id: string;
  iconName: keyof typeof OutlineIcons;
  label: string;
  description: string;
  onPress: () => void;
}

interface ProfessorActionCardProps {
  item: ProfessorActionItem;
}

export function ProfessorActionCard({ item }: ProfessorActionCardProps) {
  const Icon = OutlineIcons[item.iconName] as any;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={item.onPress}
      className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm flex-row items-center w-full"
    >
      <View className="mr-4 w-12 h-12 rounded-full bg-emerald-50 items-center justify-center">
        {Icon && <Icon size={24} color="#00623B" />}
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-bold text-base leading-tight mb-1">
          {item.label}
        </Text>
        <Text className="text-gray-500 text-xs">
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
