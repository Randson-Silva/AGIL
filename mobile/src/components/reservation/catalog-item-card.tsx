import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { UNIT_LABELS } from '../../utils/constants';

interface CatalogItemCardProps {
  item: any;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function CatalogItemCard({
  item,
  quantity,
  onIncrement,
  onDecrement,
}: CatalogItemCardProps) {
  const isRestricted = Boolean(item.equipamentoInfo?.uso_restrito ?? item.uso_restrito);

  const unitLabel = UNIT_LABELS[item.tipo_medida] || item.tipo_medida || 'unidades';

  const categoryLabel =
    item.categoria === 'REAGENTE'
      ? 'Reagente'
      : item.categoria === 'SOLUCAO'
        ? 'Solução'
        : item.categoria === 'VIDRARIA'
          ? 'Vidraria'
          : item.categoria === 'EQUIPAMENTO'
            ? 'Equipamento'
            : item.categoria;

  const extraInfo = item.localizacao ? item.localizacao : 'Sem localização';

  const handleIncrement = () => {
    if (isRestricted) {
      Toast.show({
        type: 'error',
        text1: 'Uso restrito',
        text2: 'Este equipamento não pode ser retirado do laboratório',
      });
      return;
    }
    onIncrement();
  };

  return (
    <View className="bg-white border border-gray-100 shadow-sm rounded-[24px] p-5 mb-4 mx-6 flex-row justify-between items-center">
      <View className="flex-1 pr-4">
        <Text className="text-base font-bold text-gray-900 mb-1">{item.nome}</Text>
        <Text className="text-xs text-gray-500">{categoryLabel}</Text>
        <Text className="text-xs text-gray-500">{extraInfo}</Text>
        <Text className="text-xs text-gray-500 mt-1">
          {item.quantidade_saldo} {unitLabel} disponíveis
        </Text>

        {isRestricted && (
          <View className="flex-row items-center self-start bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full mt-2">
            <Feather name="lock" size={12} color="#B45309" />
            <Text className="text-[11px] font-bold text-amber-800 ml-1.5">
              Apenas uso no laboratório
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row items-center bg-gray-50 rounded-full border border-gray-200">
        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={onDecrement}
          disabled={quantity <= 0}
        >
          <Feather name="minus" size={18} color={quantity <= 0 ? '#D1D5DB' : '#374151'} />
        </TouchableOpacity>

        <Text className="font-bold text-gray-900 w-6 text-center">{quantity}</Text>

        <TouchableOpacity
          className="w-10 h-10 items-center justify-center"
          onPress={handleIncrement}
        >
          <Feather name="plus" size={18} color={isRestricted ? '#9CA3AF' : '#00623B'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
