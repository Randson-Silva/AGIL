import React from 'react';
import { Text, View } from 'react-native';

interface PermissionsListCardProps {
  permissions: string[];
}

export const PermissionsListCard: React.FC<PermissionsListCardProps> = ({ permissions }) => {
  return (
    <View className="mb-6">
      <Text className="text-base font-bold text-gray-900 mb-3">Permissões do perfil</Text>

      <View className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {permissions.map((permission, index) => {
          const isLast = index === permissions.length - 1;
          return (
            <View
              key={permission}
              className={`px-5 py-4 ${!isLast ? 'border-b border-gray-200' : ''}`}
            >
              <Text className="text-sm text-gray-800 font-medium">{permission}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
