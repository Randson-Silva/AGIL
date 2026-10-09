import React from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

interface CancelReservationModalProps {
  visible: boolean;
  reservationProtocol: string;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelReservationModal({
  visible,
  reservationProtocol,
  onClose,
  onConfirm,
  isLoading = false,
}: CancelReservationModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center items-center p-6">
        <View className="bg-white rounded-[32px] p-6 w-full shadow-lg">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Cancelar a reserva {reservationProtocol}?
          </Text>
          <Text className="text-gray-500 text-sm mb-8 leading-5">
            O horário volta para a agenda e o técnico é notificado por e-mail.
            (Atenção: A função de cancelamento no backend ainda está em construção).
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-2xl py-4 items-center justify-center bg-white"
            >
              <Text className="text-gray-900 font-bold text-base">Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-[#DC2626] rounded-2xl py-4 items-center justify-center"
            >
              <Text className="text-white font-bold text-base">
                {isLoading ? 'Cancelando...' : 'Cancelar reserva'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
