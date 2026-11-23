import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { UsageLog } from '../../services/reservation.service';
import { formatReservationDateTime } from '../../utils/usage-log.utils';

interface UsageLogCardProps {
  item: UsageLog;
  onPress: (item: UsageLog) => void;
}

export function UsageLogCard({ item, onPress }: UsageLogCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(item)}
      className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm mx-6"
    >
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-gray-900 font-bold text-base flex-1 mr-2">{item.nomePratica}</Text>
        <View className="bg-emerald-100 px-3 py-1 rounded-full">
          <Text className="text-emerald-800 font-medium text-xs">Concluída</Text>
        </View>
      </View>

      {item.reserva && (
        <Text className="text-gray-500 text-sm mb-2">
          {item.reserva.local} ·{' '}
          {formatReservationDateTime(item.reserva.data_reserva, item.reserva.horarios)}
        </Text>
      )}

      <View className="flex-row items-center justify-between pt-3 border-t border-gray-100">
        <Text className="text-gray-600 text-xs">
          {item.professorResponsavel} · {item.numeroAlunos} alunos
        </Text>
        <View className="flex-row items-center gap-1">
          <Text className="text-[#00623B] font-semibold text-xs">Ver relatório</Text>
          <Feather name="chevron-right" size={14} color="#00623B" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
