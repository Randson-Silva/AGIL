import React from 'react';
import { Text, View } from 'react-native';

interface UserInfoCardProps {
  name: string;
  email: string;
  initials: string;
  roleLabel: string;
}

export const UserInfoCard: React.FC<UserInfoCardProps> = ({
  name,
  email,
  initials,
  roleLabel,
}) => {
  return (
    <View className="bg-white border border-gray-200 rounded-3xl p-5 flex-row items-center mb-8 shadow-sm">
      <View className="w-16 h-16 bg-emerald-100 rounded-full items-center justify-center mr-4">
        <Text className="text-[#00623B] font-bold text-xl uppercase">{initials}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-lg font-extrabold text-gray-900" numberOfLines={1}>
          {name}
        </Text>
        {email ? (
          <Text className="text-sm text-gray-500 mt-0.5" numberOfLines={1}>
            {email}
          </Text>
        ) : null}
        <Text className="text-xs font-bold text-[#00623B] mt-1.5">{roleLabel}</Text>
      </View>
    </View>
  );
};
