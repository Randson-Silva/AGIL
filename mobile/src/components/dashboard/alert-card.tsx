import { Text, View, TouchableOpacity } from 'react-native';
import { AlertBadge } from './alert-badge';
import { AlertItem } from './types';

interface AlertCardProps {
  item: AlertItem;
}

export function AlertCard({ item }: AlertCardProps) {
  const Container = item.onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={item.onPress ? 0.7 : 1}
      onPress={item.onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm"
    >
      <View className="flex-row items-center justify-between mb-3">
        <AlertBadge status={item.status} />
        <Text className="text-gray-400 text-xs">{item.timeAgo}</Text>
      </View>
      <Text className="text-base font-bold text-gray-900 mb-1">{item.title}</Text>
      <Text className="text-gray-500 text-sm leading-tight">{item.description}</Text>
    </Container>
  );
}
