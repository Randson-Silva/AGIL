import React, { useState, useMemo, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface CalendarModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  onSelectDate: (dateIso: string) => void;
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export const CalendarModal: React.FC<CalendarModalProps> = ({
  visible,
  onClose,
  selectedDate,
  onSelectDate,
}) => {
  const todayInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');

    return {
      year,
      month,
      day,
      iso: `${year}-${mm}-${dd}`,
    };
  }, []);

  const initialDate = useMemo(() => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    return new Date();
  }, [selectedDate]);

  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [showMonthList, setShowMonthList] = useState(false);
  const [showYearList, setShowYearList] = useState(false);

  useEffect(() => {
    if (visible) {
      setViewMonth(initialDate.getMonth());
      setViewYear(initialDate.getFullYear());
      setShowMonthList(false);
      setShowYearList(false);
    }
  }, [visible, initialDate]);

  const availableYears = useMemo(() => {
    return [todayInfo.year, todayInfo.year + 1, todayInfo.year + 2];
  }, [todayInfo.year]);

  const handleSelectYear = (yr: number) => {
    setViewYear(yr);
    if (yr === todayInfo.year && viewMonth < todayInfo.month) {
      setViewMonth(todayInfo.month);
    }
    setShowYearList(false);
  };

  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: Array<{
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
    }> = [];

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      days.push({
        day: daysInPrevMonth - i,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
      });
    }

    for (let d = 1; d <= daysInCurrentMonth; d++) {
      days.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
      });
    }

    const remainingSlots = (7 - (days.length % 7)) % 7;
    for (let d = 1; d <= remainingSlots; d++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      days.push({
        day: d,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
      });
    }

    return days;
  }, [viewMonth, viewYear]);

  const formatToIso = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View className="w-full bg-[#F8FBF9] rounded-[32px] p-5 border border-[#00623B]/20 shadow-lg">
          <View className="bg-[#E3F3EC] rounded-3xl py-5 px-4 items-center relative mb-4">
            <Text className="text-xl font-bold text-[#064E3B] mb-4">Selecionar Reserva</Text>

            <TouchableOpacity
              onPress={onClose}
              className="absolute right-3 top-3 w-7 h-7 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <Feather name="x" size={16} color="#4B5563" />
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowMonthList(!showMonthList);
                  setShowYearList(false);
                }}
                className="bg-[#00623B] px-4 py-2 rounded-xl flex-row items-center gap-2"
              >
                <Text className="text-white font-semibold text-sm">{MONTHS[viewMonth]}</Text>
                <Feather name="chevron-down" size={16} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowYearList(!showYearList);
                  setShowMonthList(false);
                }}
                className="bg-[#00623B] px-4 py-2 rounded-xl flex-row items-center gap-2"
              >
                <Text className="text-white font-semibold text-sm">{viewYear}</Text>
                <Feather name="chevron-down" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {showMonthList && (
            <View className="flex-row flex-wrap justify-between bg-white p-3 rounded-2xl border border-gray-200 mb-3 gap-y-2">
              {MONTHS.map((m, idx) => {
                const isPastMonth = viewYear === todayInfo.year && idx < todayInfo.month;
                const isSelectedMonth = viewMonth === idx;

                return (
                  <TouchableOpacity
                    key={m}
                    disabled={isPastMonth}
                    onPress={() => {
                      setViewMonth(idx);
                      setShowMonthList(false);
                    }}
                    className={`w-[31%] py-2 rounded-lg items-center ${
                      isSelectedMonth
                        ? 'bg-[#00623B]'
                        : isPastMonth
                          ? 'bg-gray-100 opacity-40'
                          : 'bg-gray-50'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isSelectedMonth
                          ? 'text-white'
                          : isPastMonth
                            ? 'text-gray-400'
                            : 'text-gray-700'
                      }`}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {showYearList && (
            <View className="flex-row justify-around bg-white p-3 rounded-2xl border border-gray-200 mb-3">
              {availableYears.map((yr) => (
                <TouchableOpacity
                  key={yr}
                  onPress={() => handleSelectYear(yr)}
                  className={`px-5 py-2 rounded-lg ${
                    viewYear === yr ? 'bg-[#00623B]' : 'bg-gray-50'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      viewYear === yr ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {yr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View className="border border-[#B7D7C8] rounded-3xl p-4 bg-white">
            <View className="flex-row justify-between mb-3">
              {WEEKDAYS.map((dayName) => (
                <View key={dayName} className="w-[14.28%] items-center">
                  <Text className="text-xs font-bold text-gray-600">{dayName}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {calendarDays.map((item, index) => {
                const isoDate = formatToIso(item.year, item.month, item.day);
                const isSelected = selectedDate === isoDate;
                const isPastDate = isoDate < todayInfo.iso;

                return (
                  <TouchableOpacity
                    key={`${isoDate}-${index}`}
                    disabled={isPastDate}
                    activeOpacity={0.7}
                    onPress={() => {
                      onSelectDate(isoDate);
                      onClose();
                    }}
                    className="w-[14.28%] aspect-square items-center justify-center my-0.5"
                  >
                    <View
                      className={`w-9 h-9 rounded-xl items-center justify-center ${
                        isSelected ? 'bg-[#00623B]' : 'bg-transparent'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected
                            ? 'text-white font-bold'
                            : isPastDate
                              ? 'text-gray-300'
                              : item.isCurrentMonth
                                ? 'text-gray-700'
                                : 'text-gray-400'
                        }`}
                      >
                        {item.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
