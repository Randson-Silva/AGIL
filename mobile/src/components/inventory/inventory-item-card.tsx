import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { UNIT_LABELS } from '../../utils/constants';
import { getExpirationStatus } from '../../utils/date-utils';
import { InventoryItem } from '../../hooks/useInventory';

interface InventoryItemCardProps {
  item: InventoryItem;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item }) => {
  const router = useRouter();

  const isLowStock = Number(item.quantidade_saldo) <= Number(item.quantidade_minima || 0);

  const { isExpired, isExpiringSoon, daysLeft } = getExpirationStatus(item.data_validade);
  const showExpirationAlert = item.categoria === 'REAGENTE' || item.categoria === 'SOLUCAO';

  const isCriticalAlert = isLowStock || (showExpirationAlert && isExpired);
  const isWarningAlert = showExpirationAlert && isExpiringSoon;

  const formatDateToBR = (dateString?: string | null) => {
    if (!dateString) return 'Sem validade';
    const d = new Date(dateString);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const getSpecificInfo = () => {
    const parts = [];
    if (item.categoria === 'REAGENTE' && item.reagenteInfo) {
      if (item.reagenteInfo.formula) parts.push(item.reagenteInfo.formula);
      if (item.reagenteInfo.cas) parts.push(`CAS ${item.reagenteInfo.cas}`);
      if (item.reagenteInfo.marca) parts.push(item.reagenteInfo.marca);
    } else if (item.categoria === 'SOLUCAO' && item.solucaoInfo) {
      if (item.solucaoInfo.formula) parts.push(item.solucaoInfo.formula);
      if (item.solucaoInfo.cas) parts.push(`CAS ${item.solucaoInfo.cas}`);
    } else if (item.categoria === 'VIDRARIA' && item.vidrariaInfo) {
      if (item.vidrariaInfo.marca) parts.push(item.vidrariaInfo.marca);
      if (item.vidrariaInfo.capacidade) parts.push(item.vidrariaInfo.capacidade);
    } else if (item.categoria === 'EQUIPAMENTO' && item.equipamentoInfo) {
      if (item.equipamentoInfo.marca) parts.push(item.equipamentoInfo.marca);
      if (item.equipamentoInfo.modelo) parts.push(item.equipamentoInfo.modelo);
      if (item.equipamentoInfo.voltagem) parts.push(item.equipamentoInfo.voltagem);
    }
    return parts.join(' • ');
  };

  const specificInfoText = getSpecificInfo();
  const unitLabel = UNIT_LABELS[item.tipo_medida] || item.tipo_medida;

  return (
    <View className={`bg-white border rounded-2xl p-4 mb-3 shadow-sm ${isCriticalAlert ? 'border-red-200' : isWarningAlert ? 'border-orange-200' : 'border-gray-200'}`}>

      <View className="flex-row justify-between items-start mb-1 gap-2">
        <Text className="text-[15px] font-extrabold text-gray-900 flex-1" numberOfLines={2}>
          {item.nome}
        </Text>
        <View
          className={`px-2.5 py-0.5 rounded-full border ${isLowStock ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
        >
          <Text className={`text-[11px] font-bold ${isLowStock ? 'text-red-600' : 'text-green-700'}`}>
            {isLowStock ? 'Estoque Crítico' : 'Estoque Normal'}
          </Text>
        </View>
      </View>

      {showExpirationAlert && (isExpired || isExpiringSoon) && (
        <View className={`flex-row items-center self-start px-2 py-0.5 rounded-md mb-2 ${isExpired ? 'bg-red-100' : 'bg-orange-100'}`}>
          <Feather name="alert-circle" size={12} color={isExpired ? '#B91C1C' : '#C2410C'} />
          <Text className={`text-[11px] font-bold ml-1 ${isExpired ? 'text-red-700' : 'text-orange-700'}`}>
            {isExpired ? 'Vencido' : `Vence em ${daysLeft} dias`}
          </Text>
        </View>
      )}

      {specificInfoText ? (
        <Text className="text-gray-500 text-xs mb-3 font-medium">{specificInfoText}</Text>
      ) : (
        <View className="mb-3" />
      )}

      <View className="border-t border-gray-100 pt-3">
        <View className="flex-row justify-between items-end mb-1">
          <Text className="text-[10px] font-bold text-gray-400 tracking-wider">ESTOQUE ATUAL</Text>
          <Text className="text-[10px] font-bold text-gray-400 tracking-wider">MÍNIMO</Text>
        </View>

        <View className="flex-row justify-between items-baseline mb-2">
          <Text className={`text-xl font-extrabold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
            {item.quantidade_saldo}{' '}
            <Text className="text-xs font-medium text-gray-500">{unitLabel}</Text>
          </Text>
          <Text className="text-lg font-bold text-gray-800">{item.quantidade_minima || '-'}</Text>
        </View>

        <Text className="text-gray-500 text-xs mb-4 font-medium" numberOfLines={2}>
          {item.localizacao || 'Sem localização'} • Val. {formatDateToBR(item.data_validade)}
        </Text>

        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() =>
              router.push({ pathname: '/edit-item', params: { itemData: JSON.stringify(item) } })
            }
            className="flex-1 border border-gray-300 rounded-full py-2.5 items-center justify-center"
          >
            <Text className="text-gray-800 font-bold text-[13px]">Editar dados</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: '/adjust-inventory',
                params: { itemData: JSON.stringify(item) },
              })
            }
            className="flex-1 bg-[#00623B] rounded-full py-2.5 items-center justify-center"
          >
            <Text className="text-white font-bold text-[13px]">Ajustar estoque</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};