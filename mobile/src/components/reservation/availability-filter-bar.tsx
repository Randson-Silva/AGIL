import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LABORATORIES } from '../../utils/constants';

export interface DayPill {
  isoDate: string;
  label: string;
}

interface AvailabilityFilterBarProps {
  selectedLabFilter: string;
  onSelectLabFilter: (lab: string) => void;
  days: DayPill[];
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
  onOpenCalendar: () => void;
}

export const AvailabilityFilterBar: React.FC<AvailabilityFilterBarProps> = ({
  selectedLabFilter,
  onSelectLabFilter,
  days,
  selectedDate,
  onSelectDate,
  onOpenCalendar,
}) => {
  const labOptions = ['Todos', ...LABORATORIES.map((l) => l.name)];

  return (
    <View className="mb-4">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
      >
        {labOptions.map((labName) => {
          const isSelected = selectedLabFilter === labName;

          return (
            <TouchableOpacity
              key={labName}
              activeOpacity={0.7}
              onPress={() => onSelectLabFilter(labName)}
              className={`px-4 py-2 rounded-full border ${
                isSelected ? 'bg-[#00623B] border-[#00623B]' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}
              >
                {labName}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {days.map((day) => {
          const isSelected = selectedDate === day.isoDate;

          return (
            <TouchableOpacity
              key={day.isoDate}
              activeOpacity={0.7}
              onPress={() => onSelectDate(day.isoDate)}
              className={`px-3.5 py-2.5 rounded-full border ${
                isSelected ? 'bg-[#E3F3EC] border-[#00623B]' : 'bg-white border-gray-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${isSelected ? 'text-[#00623B]' : 'text-gray-800'}`}
              >
                {day.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenCalendar}
          className="px-3.5 py-2.5 rounded-full border border-gray-200 bg-white flex-row items-center justify-center"
        >
          <Feather name="calendar" size={14} color="#00623B" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};
