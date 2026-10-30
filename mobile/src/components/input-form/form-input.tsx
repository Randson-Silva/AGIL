import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  className,
  placeholderTextColor = '#6B7280', 
  ...rest
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-700">{label}</Text>
      <TextInput
        placeholderTextColor={placeholderTextColor}
        className={`border border-gray-300 rounded-lg h-[50px] p-3 text-base text-gray-900 bg-white ${
          className || ''
        }`}
        {...rest}
      />
    </View>
  );
};