import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Platform,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';

import { PageWrapper } from '../../../components/ui/page-wrapper';
import { BackButton } from '../../../components/ui/Back-button';
import { LabSelector } from '../../../components/reservation/lab-selector';
import { ObjectiveSelector } from '../../../components/reservation/objective-selector';
import { CalendarModal } from '../../../components/reservation/calendar-modal';
import { TimeSlotModal } from '../../../components/reservation/time-slot-modal';
import { LABORATORIES, ReservationObjective, TimeSlot } from '../../../utils/constants';
import { createReservation, getOccupiedTimeSlots } from '../../../services/reservation.service';

export default function NewReservationScreen() {
  const router = useRouter();
  const { initialLab, initialDate } = useLocalSearchParams<{
    initialLab?: string;
    initialDate?: string;
  }>();

  const [selectedLab, setSelectedLab] = useState(initialLab || LABORATORIES[0].name);
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<TimeSlot[]>([]);
  const [objective, setObjective] = useState<ReservationObjective>('AULA_PRATICA');
  const [title, setTitle] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDisplayDate = (isoDate: string) => {
    if (!isoDate) return 'Selecionar data';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const fetchOccupiedSlots = useCallback(async (lab: string, date: string) => {
    if (!lab || !date) return;

    try {
      setIsLoadingSlots(true);
      const response = await getOccupiedTimeSlots(lab, date);
      const occupied = response.data || [];
      setOccupiedSlots(occupied);

      setSelectedSlots((prev) =>
        prev.filter(
          (sel) =>
            !occupied.some(
              (occ) => occ.hora_inicio === sel.hora_inicio && occ.hora_fim === sel.hora_fim,
            ),
        ),
      );
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Aviso',
        text2: 'Não foi possível carregar os horários ocupados para esta data.',
      });
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    if (selectedLab && selectedDate) {
      fetchOccupiedSlots(selectedLab, selectedDate);
    }
  }, [selectedLab, selectedDate, fetchOccupiedSlots]);

  const handleToggleSlot = (slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (item) => item.hora_inicio === slot.hora_inicio && item.hora_fim === slot.hora_fim,
      );

      if (exists) {
        return prev.filter(
          (item) => !(item.hora_inicio === slot.hora_inicio && item.hora_fim === slot.hora_fim),
        );
      }

      return [...prev, slot].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
    });
  };

  const handleOpenTimeModal = () => {
    if (!selectedDate) {
      Toast.show({
        type: 'info',
        text1: 'Selecione uma data',
        text2: 'Escolha primeiro a data da reserva para ver os horários disponíveis.',
      });
      return;
    }
    setIsTimeModalOpen(true);
  };

  const handleConfirmReservation = async () => {
    if (!selectedDate) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Selecione a data da reserva.',
      });
      return;
    }

    if (selectedSlots.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Selecione pelo menos um horário para a prática.',
      });
      return;
    }

    if (!title.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Campo obrigatório',
        text2: 'Informe o título da prática.',
      });
      return;
    }

    const parsedStudents = parseInt(studentCount, 10);
    if (!parsedStudents || parsedStudents <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Valor inválido',
        text2: 'Informe uma quantidade válida de alunos.',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      await createReservation({
        local: selectedLab,
        data_reserva: selectedDate,
        objetivo: objective,
        titulo: title.trim(),
        quantidade_alunos: parsedStudents,
        observacoes: notes.trim() || undefined,
        pratica_recorrente: isRecurring,
        horarios: selectedSlots,
      });

      Toast.show({
        type: 'success',
        text1: 'Reserva solicitada',
        text2: 'Solicitação enviada para avaliação técnica.',
      });

      router.back();
    } catch (error) {
      let errorMessage = 'Não foi possível registar a reserva. Tente novamente.';

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;

        if (status === 400) {
          const apiMessage = error.response.data?.message;
          if (apiMessage) {
            errorMessage = Array.isArray(apiMessage) ? apiMessage[0] : apiMessage;
          }
        } else if (status === 401) {
          errorMessage = 'A sua sessão expirou. Por favor, faça login novamente.';
        } else if (status === 403) {
          errorMessage = 'Apenas utilizadores com perfil de Professor podem solicitar reservas.';
        } else if (status >= 500) {
          errorMessage = 'O nosso servidor está a enfrentar instabilidades. Tente mais tarde.';
        }
      }

      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageWrapper className="bg-[#F4F7F4]">
      <KeyboardAwareScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={Platform.OS === 'ios' ? 20 : 160}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-4 mt-2 mb-6">
          <BackButton />
          <Text className="text-2xl font-bold text-gray-900">Nova Reserva</Text>
        </View>

        <LabSelector selectedLab={selectedLab} onSelectLab={setSelectedLab} />

        <View className="mb-5">
          <Text className="text-sm font-bold text-gray-800 mb-2">Data da reserva</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setIsCalendarOpen(true)}
            className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3.5"
          >
            <Feather name="calendar" size={18} color="#6B7280" />
            <Text
              className={`ml-3 text-sm font-medium ${
                selectedDate ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              {formatDisplayDate(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text className="text-sm font-bold text-gray-800 mb-2">Horário</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleOpenTimeModal}
            className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 min-h-[52px]"
          >
            <Feather name="clock" size={18} color="#6B7280" />

            {selectedSlots.length === 0 ? (
              <Text className="ml-3 text-sm font-medium text-gray-400">Selecionar horários</Text>
            ) : (
              <View className="flex-1 flex-row flex-wrap gap-2 ml-3">
                {selectedSlots.map((slot) => (
                  <View
                    key={`${slot.hora_inicio}-${slot.hora_fim}`}
                    className="px-3 py-1 rounded-full border border-gray-200 bg-gray-50"
                  >
                    <Text className="text-xs font-semibold text-gray-800">
                      {slot.hora_inicio} — {slot.hora_fim}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        </View>

        <ObjectiveSelector selectedObjective={objective} onSelectObjective={setObjective} />

        <View className="mb-5">
          <Text className="text-sm font-bold text-gray-800 mb-2">Título</Text>
          <View className="bg-white border border-gray-200 rounded-2xl px-4 h-[50px] justify-center">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ex.: Titulação Ácido-Base"
              placeholderTextColor="#9CA3AF"
              multiline={false}
              numberOfLines={1}
              scrollEnabled={false}
              textAlignVertical="center"
              className="text-sm text-gray-900 p-0"
            />
          </View>
        </View>

        <View className="mb-5">
          <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 h-[50px] w-48">
            <View className="flex-row items-center">
              <Feather name="user" size={16} color="#4B5563" />
              <Text className="text-xs font-bold text-gray-800 ml-2">Alunos</Text>
            </View>

            <View className="bg-[#E8F0EC] rounded-full px-3 h-7 justify-center min-w-[48px]">
              <TextInput
                value={studentCount}
                onChangeText={(val) => setStudentCount(val.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor="#6B7280"
                maxLength={3}
                multiline={false}
                numberOfLines={1}
                scrollEnabled={false}
                textAlignVertical="center"
                className="text-center text-xs font-bold text-gray-900 p-0"
              />
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3.5 mb-5">
          <View className="flex-1 pr-4">
            <Text className="text-sm font-bold text-gray-800">Prática Recorrente (Aula Fixa)</Text>
            <Text className="text-xs text-gray-500 mt-0.5">
              Reserva este horário fixo semanalmente e contorna o limite de 24h
            </Text>
          </View>
          <Switch
            value={isRecurring}
            onValueChange={setIsRecurring}
            trackColor={{ false: '#D1D5DB', true: '#A7F3D0' }}
            thumbColor={isRecurring ? '#00623B' : '#F3F4F6'}
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-bold text-gray-800 mb-2">Observações</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Turma, disciplina..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white border border-gray-200 rounded-2xl p-4 text-sm text-gray-900 min-h-[100px]"
          />
        </View>

        <View className="flex-row gap-4">
          <TouchableOpacity
            activeOpacity={0.7}
            disabled={isSubmitting}
            onPress={() => router.back()}
            className="flex-1 bg-[#E8ECE9] rounded-2xl py-4 items-center justify-center"
          >
            <Text className="text-gray-900 font-bold text-sm">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            disabled={isSubmitting}
            onPress={handleConfirmReservation}
            className="flex-1 bg-[#00623B] rounded-2xl py-4 items-center justify-center"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-white font-bold text-sm">Confirmar</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <CalendarModal
        visible={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <TimeSlotModal
        visible={isTimeModalOpen}
        onClose={() => setIsTimeModalOpen(false)}
        selectedSlots={selectedSlots}
        occupiedSlots={occupiedSlots}
        onToggleSlot={handleToggleSlot}
        isLoading={isLoadingSlots}
      />
    </PageWrapper>
  );
}
