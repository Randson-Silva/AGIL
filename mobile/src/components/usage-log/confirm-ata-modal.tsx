import { ActivityIndicator, Modal, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmAtaModalProps {
  visible: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmAtaModal({
  visible,
  loading = false,
  title = 'Confirmar envio?',
  description = 'A ata será enviada para o técnico.',
  confirmLabel = 'Confirmar',
  onCancel,
  onConfirm,
}: ConfirmAtaModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={loading ? undefined : onCancel}
        className="flex-1 bg-black/50 items-center justify-center px-6"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-lg"
        >
          <Text className="text-gray-900 font-bold text-lg text-center">{title}</Text>

          <Text className="text-gray-500 text-sm text-center mt-2 mb-6 leading-5">
            {description}
          </Text>

          <View className="flex-row gap-3">
            <TouchableOpacity
              activeOpacity={0.75}
              disabled={loading}
              onPress={onCancel}
              className="flex-1 bg-white border border-gray-200 py-3 rounded-2xl items-center justify-center"
            >
              <Text className="text-gray-700 font-semibold text-sm">Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={loading}
              onPress={onConfirm}
              className="flex-1 bg-[#00623B] py-3 rounded-2xl items-center justify-center"
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text className="text-white font-semibold text-sm">{confirmLabel}</Text>
              )}
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
