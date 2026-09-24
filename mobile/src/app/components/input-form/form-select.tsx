import React from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';

interface Option {
  label: string;
  value: string;
}

interface FormSelectProps {
  label: string;
  selectedValue: string;
  onValueChange: (itemValue: string) => void;
  options: Option[];
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-600">{label}</Text>
      <View className="border border-gray-300 rounded-lg bg-white overflow-hidden">
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={{ height: 50 }}>
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color="#374151"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};
