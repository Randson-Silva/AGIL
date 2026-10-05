import React from 'react';
import { Modal, View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { TIME_SLOTS_BY_SHIFT, TimeSlot } from '../../utils/constants';

interface TimeSlotModalProps {
  visible: boolean;
  onClose: () => void;
  selectedSlots: TimeSlot[];
  occupiedSlots: TimeSlot[];
  onToggleSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export const TimeSlotModal: React.FC<TimeSlotModalProps> = ({
  visible,
  onClose,
  selectedSlots,
  occupiedSlots,
  onToggleSlot,
  isLoading = false,
}) => {
  const isSlotOccupied = (slot: TimeSlot) =>
    occupiedSlots.some(
      (occ) => occ.hora_inicio === slot.hora_inicio && occ.hora_fim === slot.hora_fim,
    );

  const isSlotSelected = (slot: TimeSlot) =>
    selectedSlots.some(
      (sel) => sel.hora_inicio === slot.hora_inicio && sel.hora_fim === slot.hora_fim,
    );

  const shifts = Object.keys(TIME_SLOTS_BY_SHIFT) as (keyof typeof TIME_SLOTS_BY_SHIFT)[];

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
            <ScrollView showsVerticalScrollIndicator={false}>
              {shifts.map((shift) => (
                <View key={shift} className="mb-4">
                  <Text className="text-base font-bold text-gray-900 mb-2.5">{shift}</Text>

                  <View className="flex-row flex-wrap justify-between gap-y-2.5">
                    {TIME_SLOTS_BY_SHIFT[shift].map((slot) => {
                      const occupied = isSlotOccupied(slot);
                      const selected = isSlotSelected(slot);

                      let containerStyle = 'bg-white border-gray-200';
                      let textStyle = 'text-gray-900 font-medium';

                      if (occupied) {
                        containerStyle = 'bg-gray-200 border-gray-200';
                        textStyle = 'text-gray-500 font-medium';
                      } else if (selected) {
                        containerStyle = 'bg-[#E3F3EC] border-[#00623B]';
                        textStyle = 'text-[#00623B] font-bold';
                      }

                      return (
                        <TouchableOpacity
                          key={`${slot.hora_inicio}-${slot.hora_fim}`}
                          disabled={occupied}
                          activeOpacity={0.7}
                          onPress={() => onToggleSlot(slot)}
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
          )}
        </View>
      </View>
    </Modal>
  );
};
