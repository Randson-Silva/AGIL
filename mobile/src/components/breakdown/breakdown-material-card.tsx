import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { InventoryItem } from '../../hooks/useInventory';

interface BreakdownMaterialCardProps {
  item: InventoryItem;
  isSelected: boolean;
  quantity: string;
  onToggleSelect: () => void;
  onChangeQuantity: (value: string) => void;
}

const SHORT_UNIT_LABELS: Record<string, string> = {
  MG: 'mg',
  G: 'g',
  KG: 'kg',
  ML: 'mL',
  L: 'L',
  UN: 'un',
};

export const BreakdownMaterialCard: React.FC<BreakdownMaterialCardProps> = ({
  item,
  isSelected,
  quantity,
  onToggleSelect,
  onChangeQuantity,
}) => {
  const isChemical = item.categoria === 'REAGENTE' || item.categoria === 'SOLUCAO';
  const isUnit = item.tipo_medida === 'UN' || !isChemical;
  const unitSuffix = SHORT_UNIT_LABELS[item.tipo_medida] || item.tipo_medida;

  const getPrimaryDetails = () => {
    const parts: string[] = [];

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
    }

    return parts.join(' · ');
  };

  const getSecondaryDetails = () => {
    const parts: string[] = [];
    parts.push(item.localizacao || 'Sem localização');

    const obs = item.reagenteInfo?.observacao || item.solucaoInfo?.observacao;
    if (obs) parts.push(obs);

    return parts.join(' · ');
  };

  const primaryDetails = getPrimaryDetails();
  const secondaryDetails = getSecondaryDetails();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onToggleSelect}
      className={`rounded-2xl p-4 mb-3 border ${
        isSelected
          ? 'bg-[#E3F3EC] border-[#00623B]'
          : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <Text className="text-base font-bold text-gray-900 mb-0.5">{item.nome}</Text>

      {primaryDetails ? (
        <Text className="text-xs text-gray-500 mb-2.5">{primaryDetails}</Text>
      ) : (
        <View className="mb-1" />
      )}

      <View
        className={`h-[1px] w-full mb-2.5 ${
          isSelected ? 'bg-[#00623B]/40' : 'bg-gray-100'
        }`}
      />

      <Text className="text-xs text-gray-500">{secondaryDetails}</Text>

      {isSelected && (
        <View className="mt-2.5">
          <View className="h-[1px] w-full bg-[#00623B]/40 mb-3" />

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-gray-600 font-medium mr-3">
              Quantidade afetada
            </Text>

            <View className="flex-1 flex-row items-center bg-white border border-[#9CA3AF]/50 rounded-full h-8 px-3">
              <TextInput
                value={quantity}
                onChangeText={onChangeQuantity}
                keyboardType={isUnit ? 'number-pad' : 'decimal-pad'}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                className="flex-1 text-xs text-gray-900 py-0"
              />

              {isChemical && (
                <View className="flex-row items-center pl-2 border-l border-gray-300 ml-1">
                  <Text className="text-xs text-gray-500 font-medium">{unitSuffix}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};