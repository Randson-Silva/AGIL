import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface InventoryItemCardProps {
  item: any;
}

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'L',
  UN: 'unidades',
};

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item }) => {
  const isCritical = item.quantidade_saldo <= (item.quantidade_minima || 0);

  const formatDateToBR = (dateString?: string) => {
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
    <View className="bg-white border border-gray-200 rounded-2xl p-5 mb-4 shadow-sm">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-[17px] font-extrabold text-gray-900 flex-1 mr-2" numberOfLines={1}>
          {item.nome}
        </Text>
        <View
          className={`px-3 py-1 rounded-full border ${isCritical ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
        >
          <Text className={`text-xs font-bold ${isCritical ? 'text-red-600' : 'text-green-700'}`}>
            {isCritical ? 'Crítico' : 'Estável'}
          </Text>
        </View>
      </View>

      {specificInfoText ? (
        <Text className="text-gray-500 text-sm mb-5 font-medium">{specificInfoText}</Text>
      ) : (
        <View className="mb-5" />
      )}

      <View className="flex-row justify-between items-end mb-1">
        <Text className="text-[11px] font-bold text-gray-400 tracking-wider">ESTOQUE ATUAL</Text>
        <Text className="text-[11px] font-bold text-gray-400 tracking-wider">MÍNIMO</Text>
      </View>

      <View className="flex-row justify-between items-baseline mb-4">
        <Text className="text-2xl font-extrabold text-gray-900">
          {item.quantidade_saldo}{' '}
          <Text className="text-sm font-medium text-gray-500">{unitLabel}</Text>
        </Text>
        <Text className="text-xl font-bold text-gray-800">{item.quantidade_minima || '-'}</Text>
      </View>

      <Text className="text-gray-500 text-sm mb-5 font-medium" numberOfLines={2}>
        {item.localizacao || 'Sem localização'} • Val. {formatDateToBR(item.data_validade)}
      </Text>

      <View className="flex-row gap-3">
        <TouchableOpacity className="flex-1 border border-gray-300 rounded-lg py-3 items-center justify-center">
          <Text className="text-gray-800 font-bold text-[14px]">Editar dados</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-1 bg-green-700 rounded-lg py-3 items-center justify-center">
          <Text className="text-white font-bold text-[14px]">Ajustar estoque</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
