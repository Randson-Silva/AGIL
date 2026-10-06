import { Text, View } from 'react-native';
import { AlertStatus } from './types';

interface AlertBadgeProps {
  status: AlertStatus;
}

export function AlertBadge({ status }: AlertBadgeProps) {
  const getBadgeStyle = () => {
    switch (status) {
      case 'Avaria':
        return 'bg-red-50 border-red-200';
      case 'Estoque baixo':
        return 'bg-orange-50 border-orange-200';
      case 'Reserva':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextStyle = () => {
    switch (status) {
      case 'Avaria':
        return 'text-red-600';
      case 'Estoque baixo':
        return 'text-orange-700';
      case 'Reserva':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <View className={`px-3 py-1 rounded-full border ${getBadgeStyle()}`}>
      <Text className={`text-xs font-semibold ${getTextStyle()}`}>{status}</Text>
    </View>
  );
}
