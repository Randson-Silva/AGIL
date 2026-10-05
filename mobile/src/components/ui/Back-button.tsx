import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export const BackButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.back()}
      className="w-12 h-12 rounded-full border border-gray-200 bg-white items-center justify-center shadow-sm"
    >
      <Ionicons name="arrow-back" size={24} color="#374151" />
    </TouchableOpacity>
  );
};
