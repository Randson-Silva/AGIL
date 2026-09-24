import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

interface FormInputProps extends TextInputProps {
  label: string;
}

export const FormInput: React.FC<FormInputProps> = ({ label, className, ...rest }) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-600">{label}</Text>
      <TextInput
        className={`border border-gray-300 rounded-lg p-3 text-base ${className || ''}`}
        {...rest}
      />
    </View>
  );
};
