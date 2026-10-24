import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TIME_SLOTS_BY_SHIFT, TimeSlot } from '../../utils/constants';

interface TimeSlotModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedSlots: TimeSlot[];
  occupiedSlots: TimeSlot[];
  onConfirmSlots: (slots: TimeSlot[]) => void;
  isLoading?: boolean;
}

export function isTimeSlotInPast(slot: TimeSlot, selectedDate: string): boolean {
  if (!selectedDate) return false;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const todayIso = `${year}-${month}-${day}`;

  if (selectedDate < todayIso) return true;
  if (selectedDate > todayIso) return false;

  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMinutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${currentHours}:${currentMinutes}`;

  return slot.hora_inicio <= currentTime;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  visible,
  onClose,
  selectedDate,
  selectedSlots,
  occupiedSlots,
  onConfirmSlots,
  isLoading = false,
}) => {
  const [draftSlots, setDraftSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (visible) {
      setDraftSlots(selectedSlots);
    }
  }, [visible, selectedSlots]);

  const isSlotOccupied = (slot: TimeSlot) =>
    occupiedSlots.some(
      (occ) => occ.hora_inicio === slot.hora_inicio && occ.hora_fim === slot.hora_fim,
    );

  const isSlotSelectedInDraft = (slot: TimeSlot) =>
    draftSlots.some(
      (sel) => sel.hora_inicio === slot.hora_inicio && sel.hora_fim === slot.hora_fim,
    );

  const handleToggleDraftSlot = (slot: TimeSlot) => {
    setDraftSlots((prev) => {
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

  const handleConfirm = () => {
    onConfirmSlots(draftSlots);
    onClose();
  };

  const shifts = Object.keys(TIME_SLOTS_BY_SHIFT) as Array<keyof typeof TIME_SLOTS_BY_SHIFT>;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center px-5">
        <View className="w-full bg-[#F8FBF9] rounded-[32px] p-5 border border-[#00623B]/20 shadow-lg max-h-[85%]">
          <View className="bg-[#E3F3EC] rounded-3xl py-5 px-4 items-center justify-center relative mb-5">
            <Text className="text-xl font-bold text-[#064E3B]">Selecionar Horário</Text>

            <TouchableOpacity
              onPress={onClose}
              className="absolute right-3 top-3 w-7 h-7 bg-white rounded-full items-center justify-center shadow-sm"
            >
              <Feather name="x" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="py-12 items-center justify-center">
              <ActivityIndicator size="large" color="#00623B" />
              <Text className="text-gray-500 text-xs mt-3">
                Consultando disponibilidade do laboratório...
              </Text>
            </View>
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                {shifts.map((shift) => (
                  <View key={shift} className="mb-4">
                    <Text className="text-base font-bold text-gray-900 mb-2.5">{shift}</Text>

                    <View className="flex-row flex-wrap justify-between gap-y-2.5">
                      {TIME_SLOTS_BY_SHIFT[shift].map((slot) => {
                        const occupied = isSlotOccupied(slot);
                        const past = isTimeSlotInPast(slot, selectedDate);
                        const disabled = occupied || past;
                        const selected = !disabled && isSlotSelectedInDraft(slot);

                        let containerStyle = 'bg-white border-gray-200';
                        let textStyle = 'text-gray-900 font-medium';

                        if (disabled) {
                          containerStyle = 'bg-gray-200 border-gray-200';
                          textStyle = 'text-gray-400 font-medium';
                        } else if (selected) {
                          containerStyle = 'bg-[#E3F3EC] border-[#00623B]';
                          textStyle = 'text-[#00623B] font-bold';
                        }

                        return (
                          <TouchableOpacity
                            key={`${slot.hora_inicio}-${slot.hora_fim}`}
                            disabled={disabled}
                            activeOpacity={0.7}
                            onPress={() => handleToggleDraftSlot(slot)}
                            className={`w-[48%] py-3 rounded-full border items-center justify-center ${containerStyle}`}
                          >
                            <Text className={`text-sm ${textStyle}`}>
                              {slot.hora_inicio} — {slot.hora_fim}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleConfirm}
                className="bg-[#00623B] rounded-2xl py-3.5 items-center justify-center mt-2"
              >
                <Text className="text-white font-bold text-sm">Confirmar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};
