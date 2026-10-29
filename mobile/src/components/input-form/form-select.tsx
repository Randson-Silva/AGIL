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
  disabled?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  selectedValue,
  onValueChange,
  options,
  disabled = false,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-700">{label}</Text>
      <View
        className={`border border-gray-300 rounded-lg overflow-hidden h-[50px] justify-center ${
          disabled ? 'bg-gray-100 opacity-70' : 'bg-white'
        }`}
      >
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          enabled={!disabled}
          dropdownIconColor="#4B5563"
          style={{ height: 50, color: disabled ? '#9CA3AF' : '#1F2937' }}
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value}
              label={option.label}
              value={option.value}
              color="#1F2937"
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};