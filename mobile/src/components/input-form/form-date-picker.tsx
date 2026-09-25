import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface FormDatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
}

export const FormDatePicker: React.FC<FormDatePickerProps> = ({ label, value, onChange }) => {
  const [show, setShow] = useState(false);

  const currentDate = value ? new Date(`${value}T12:00:00Z`) : new Date();

  const formatDateToBR = (dateString: string) => {
    if (!dateString) return "Selecionar data";

    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate && event.type !== 'dismissed') {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    }
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-1 text-gray-600">{label}</Text>

      <TouchableOpacity
        onPress={() => setShow(true)}
        className="border border-gray-300 rounded-lg px-3 justify-center h-[50px] bg-white"
      >
        <Text className={value ? "text-gray-800 text-base" : "text-gray-400 text-base"}>
          {formatDateToBR(value)}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={currentDate}
          mode="date"
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};