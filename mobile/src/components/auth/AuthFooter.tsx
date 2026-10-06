import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export function SecureFooter() {
  return (
    <View className="flex-row items-center justify-center mt-auto pb-4">
      <MaterialCommunityIcons name="shield-check-outline" size={16} color="#00623B" />
      <Text className="text-xs text-gray-500 ml-1">Ambiente seguro · IFCE Campus Quixadá</Text>
    </View>
  );
}
