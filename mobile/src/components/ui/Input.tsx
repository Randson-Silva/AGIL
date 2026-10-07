import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';

interface InputProps extends TextInputProps {
  label: string;
  iconName: keyof typeof Feather.glyphMap;
  isPassword?: boolean;
  rightIconName?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
}

export function Input({ label, iconName, isPassword, secureTextEntry, rightIconName, onRightIconPress, ...rest }: InputProps) {
  const [isSecure, setIsSecure] = useState(isPassword || secureTextEntry);

  return (
    <View className="mb-4">
      <Text className="text-gray-600 text-sm mb-1 ml-1 font-medium">{label}</Text>

      <View className="flex-row items-center border border-gray-300 rounded-2xl px-4 py-3 bg-white">
        <Feather name={iconName} size={20} color="#6B7280" />

        <TextInput
          className="flex-1 ml-3 text-base text-gray-900"
          placeholderTextColor="#9CA3AF"
          secureTextEntry={isSecure}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity onPress={() => setIsSecure(!isSecure)} className="p-1 pl-3">
            <Feather name={isSecure ? 'eye-off' : 'eye'} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : rightIconName ? (
          <TouchableOpacity onPress={onRightIconPress} className="p-1 pl-3">
            <Feather name={rightIconName} size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
