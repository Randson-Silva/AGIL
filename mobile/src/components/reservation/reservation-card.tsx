import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';
import { ReservationItem } from '../../services/reservation.service';
import { canFillUsageLog, formatReservationDateTime } from '../../utils/usage-log.utils';

interface ReservationCardProps {
  item: ReservationItem;
  onCancelPress?: (item: ReservationItem) => void;
  onSendUsageLog?: (item: ReservationItem) => void;
  onViewUsageLog?: (item: ReservationItem) => void;
}

export function ReservationCard({
  item,
  onCancelPress,
  onSendUsageLog,
  onViewUsageLog,
}: ReservationCardProps) {
  let badgeConfig = { bg: 'bg-gray-100', text: 'text-gray-600', label: item.status as string };

  if (item.status === 'APROVADA') {
    badgeConfig = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Aprovada' };
  } else if (item.status === 'CONCLUIDA_COM_ATA') {
    badgeConfig = { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Concluída com ata' };
  } else if (item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES') {
    badgeConfig = { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pendente' };
  } else if (item.status === 'REJEITADA') {
    badgeConfig = { bg: 'bg-red-100', text: 'text-red-800', label: 'Ausente/Rejeitada' };
  } else if (item.status === 'CANCELADA') {
    badgeConfig = { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Cancelada' };
  }

  const protocolo = item.id ? `R-${item.id.substring(0, 4).toUpperCase()}` : 'R-1000';
  const showSendUsageLog = canFillUsageLog(item);
  const showCancelButton =
    !showSendUsageLog &&
    (item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES' || item.status === 'APROVADA');

  return (
    <View className="bg-white rounded-[24px] p-5 mb-4 border border-gray-100 shadow-sm mx-6">
      {/* Header do Card */}
      <View className="flex-row justify-between items-start mb-1">
        <Text className="text-gray-900 font-bold text-base flex-1 mr-2">{item.local}</Text>
        <View className={`${badgeConfig.bg} px-3 py-1 rounded-full`}>
          <Text className={`${badgeConfig.text} font-medium text-xs`}>{badgeConfig.label}</Text>
        </View>
      </View>

      <Text className="text-gray-500 text-sm mb-3">
        {formatReservationDateTime(item.data_reserva, item.horarios)}
      </Text>

      <Text className="text-gray-600 text-sm mb-4">
        {item.objetivo} — {item.titulo} · protocolo {protocolo}
      </Text>

      {item.status === 'REJEITADA' && (
        <View className="bg-red-50 p-3 rounded-xl mb-4">
          <Text className="text-red-600 text-xs">
            {item.motivo_rejeicao ||
              'Ausência registrada. Novas reservas ficam bloqueadas temporariamente.'}
          </Text>
        </View>
      )}

      {/* Botão Enviar Ata*/}
      {showSendUsageLog && onSendUsageLog && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSendUsageLog(item)}
          className="bg-[#00623B] py-3.5 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Feather name="file-text" size={16} color="#FFF" />
          <Text className="text-white font-semibold text-sm">Enviar ata</Text>
        </TouchableOpacity>
      )}

      {/* Botão Ver Ata (quando já concluída com ata) */}
      {item.status === 'CONCLUIDA_COM_ATA' && onViewUsageLog && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onViewUsageLog(item)}
          className="bg-[#F8FAF9] border border-emerald-200 py-3 rounded-xl flex-row items-center justify-center gap-2"
        >
          <Feather name="eye" size={16} color="#00623B" />
          <Text className="text-[#00623B] font-semibold text-sm">Ver relatório da ata</Text>
        </TouchableOpacity>
      )}

      {/* Botão Cancelar */}
      {showCancelButton && (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onCancelPress && onCancelPress(item)}
          className="bg-[#F8FAF9] border border-gray-200 py-3 rounded-xl items-center"
        >
          <Text className="text-gray-800 font-semibold text-sm">Cancelar reserva</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
