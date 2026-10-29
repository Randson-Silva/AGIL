import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface RejectModalProps {
  visible: boolean;
  protocol: string;
  reason: string;
  onChangeReason: (text: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RejectModal({
  visible,
  protocol,
  reason,
  onChangeReason,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/40 justify-center items-center p-6">
        <View className="bg-white rounded-[32px] p-6 w-full shadow-lg">
          <Text className="text-xl font-bold text-gray-900 mb-2">
            Rejeitar solicitação {protocol}?
          </Text>
          <Text className="text-gray-500 text-sm mb-4 leading-5">
            Informe o motivo da rejeição para que o solicitante seja notificado.
          </Text>

          <View className="bg-[#F8FAF9] border border-gray-200 rounded-2xl p-3.5 mb-6 min-h-[96px]">
            <TextInput
              value={reason}
              onChangeText={onChangeReason}
              placeholder="Descreva o motivo da rejeição..."
              placeholderTextColor="#9CA3AF"
              multiline
              textAlignVertical="top"
              editable={!isLoading}
              className="text-gray-900 text-sm min-h-[72px]"
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              disabled={isLoading}
              className="flex-1 border border-gray-200 rounded-2xl py-3.5 items-center justify-center bg-white"
            >
              <Text className="text-gray-900 font-bold text-sm">Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-[#DC2626] rounded-2xl py-3.5 items-center justify-center"
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-white font-bold text-sm">Rejeitar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
