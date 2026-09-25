import { Feather } from '@expo/vector-icons';
import { Text, TextInput, TextInputProps, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
}

export function Input({ label, iconName, ...rest }: InputProps) {
  return (
    <View className="mb-4">
      <Text className="text-gray-600 text-sm mb-1 ml-1 font-medium">{label}</Text>
      <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3 bg-white">
        <Feather name={iconName} size={20} color="#6B7280" />
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900"
          placeholderTextColor="#9CA3AF"
          {...rest}
        />
      </View>
    </View>
  );
}
