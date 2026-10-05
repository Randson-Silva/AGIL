import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { BackButton } from '../../../components/ui/Back-button';
import {
  AvailabilityFilterBar,
  DayPill,
} from '../../../components/reservation/availability-filter-bar';
import { AvailabilitySlotCard } from '../../../components/reservation/availability-slot-card';
import { CalendarModal } from '../../../components/reservation/calendar-modal';
import { ALL_TIME_SLOTS, LABORATORIES } from '../../../utils/constants';
import { getDailyAvailability, OccupiedSlotDetail } from '../../../services/reservation.service';
import { useAuth } from '../../../hooks/useAuth';

const SHORT_WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function AvailabilityScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const upcomingDays = useMemo<DayPill[]>(() => {
    const pills: DayPill[] = [];
    const cursor = new Date();

    while (pills.length < 6) {
      if (cursor.getDay() !== 0) {
        const dayNumber = String(cursor.getDate()).padStart(2, '0');
        const weekdayName = SHORT_WEEKDAYS[cursor.getDay()];
        pills.push({
          isoDate: formatDateToIso(cursor),
          label: `${weekdayName} ${dayNumber}`,
        });
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return pills;
  }, []);

  const [selectedLabFilter, setSelectedLabFilter] = useState('Todos');
  const [selectedDate, setSelectedDate] = useState(
    upcomingDays[0]?.isoDate || formatDateToIso(new Date()),
  );
  const [occupiedList, setOccupiedList] = useState<OccupiedSlotDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const displayedDays = useMemo<DayPill[]>(() => {
    const exists = upcomingDays.some((d) => d.isoDate === selectedDate);
    if (exists) return upcomingDays;

    const [y, m, d] = selectedDate.split('-').map(Number);
    const customDate = new Date(y, m - 1, d);
    const customLabel = `${SHORT_WEEKDAYS[customDate.getDay()]} ${String(d).padStart(2, '0')}`;

    return [{ isoDate: selectedDate, label: customLabel }, ...upcomingDays.slice(0, 5)];
  }, [upcomingDays, selectedDate]);

  const loadAvailability = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getDailyAvailability(selectedDate, selectedLabFilter);
      setOccupiedList(response.data || []);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível carregar a agenda',
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, selectedLabFilter]);

  useFocusEffect(
    useCallback(() => {
      loadAvailability();
    }, [loadAvailability]),
  );

  const slotItems = useMemo(() => {
    const labsToDisplay =
      selectedLabFilter === 'Todos'
        ? LABORATORIES
        : LABORATORIES.filter((l) => l.name === selectedLabFilter);

    const items: {
      key: string;
      startTime: string;
      endTime: string;
      labName: string;
      occupation?: OccupiedSlotDetail;
    }[] = [];

    for (const slot of ALL_TIME_SLOTS) {
      for (const lab of labsToDisplay) {
        const occupation = occupiedList.find(
          (occ) =>
            occ.local === lab.name &&
            occ.hora_inicio === slot.hora_inicio &&
            occ.hora_fim === slot.hora_fim,
        );

        items.push({
          key: `${lab.id}-${slot.hora_inicio}-${slot.hora_fim}`,
          startTime: slot.hora_inicio,
          endTime: slot.hora_fim,
          labName: lab.name,
          occupation,
        });
      }
    }

    return items;
  }, [selectedLabFilter, occupiedList]);

  const handleNavigateToNewReservation = () => {
    router.push({
      pathname: '/(protected)/(professor)/new-reservation',
      params: {
        initialDate: selectedDate,
        initialLab: selectedLabFilter !== 'Todos' ? selectedLabFilter : LABORATORIES[0].name,
      },
    });
  };

  return (
    <PageWrapper className="bg-[#F4F7F4]">
      <View className="flex-1 px-4 pt-2">
        <View className="flex-row items-center gap-4 mt-2 mb-4">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900">Disponibilidade</Text>
        </View>

        <AvailabilityFilterBar
          selectedLabFilter={selectedLabFilter}
          onSelectLabFilter={setSelectedLabFilter}
          days={displayedDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          onOpenCalendar={() => setIsCalendarOpen(true)}
        />

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#00623B" />
            <Text className="text-xs text-gray-500 mt-3">
              Carregando horários do laboratório...
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {slotItems.map((item) => (
              <AvailabilitySlotCard
                key={item.key}
                startTime={item.startTime}
                endTime={item.endTime}
                labName={item.labName}
                occupation={item.occupation}
              />
            ))}

            <View className="border border-dashed border-gray-300 rounded-2xl p-4 mt-2 mb-4 bg-white/60">
              <Text className="text-xs text-gray-500 leading-5">
                Aulas práticas têm prioridade sobre as reservas de pesquisa/TCC no mesmo horário
              </Text>
            </View>
          </ScrollView>
        )}

        {user?.profile === 'PROFESSOR' && (
          <View className="pt-2 pb-2 bg-[#F4F7F4]">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNavigateToNewReservation}
              className="bg-[#00623B] rounded-2xl py-4 flex-row items-center justify-center gap-2 shadow-sm"
            >
              <Feather name="plus-circle" size={18} color="#FFFFFF" />
              <Text className="text-white font-bold text-sm">Nova Reserva</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <CalendarModal
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
    </PageWrapper>
  );
}
