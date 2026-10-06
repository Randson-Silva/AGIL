import * as OutlineIcons from 'react-native-heroicons/outline';
import { Text, View } from 'react-native';
import { StatItem } from './types';

interface StatCardProps {
  item: StatItem;
}

export function StatCard({ item }: StatCardProps) {
  const getIconColor = () => {
    switch (item.iconName) {
      case 'ClipboardDocumentCheckIcon':
        return '#00623B'; // Verde
      case 'ExclamationTriangleIcon':
        return '#EF4444'; // Vermelho
      case 'CubeIcon':
        return '#00623B'; // Verde
      default:
        return '#00623B';
    }
  };

  const getTextColor = () => {
    if (item.iconName === 'ExclamationTriangleIcon') return 'text-red-500';
    return 'text-gray-900';
  };

  const Icon = (OutlineIcons as any)[item.iconName];

  return (
    <View className="bg-white rounded-3xl p-4 mr-3 border border-gray-100 shadow-sm w-[110px]">
      {Icon && <Icon size={24} color={getIconColor()} className="mb-2" />}
      <Text className={`text-2xl font-bold mb-1 ${getTextColor()}`}>{item.count}</Text>
      <Text className="text-gray-500 text-xs leading-tight">{item.label}</Text>
    </View>
  );
}
