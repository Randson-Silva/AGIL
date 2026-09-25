import React from 'react';
import { View, Text } from 'react-native';

interface InventoryItemCardProps {
  item: any;
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ item }) => {
  const isCritical = item.quantidade_saldo <= (item.quantidade_minima || 0);

  return (
    <View className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="font-bold text-lg text-gray-800">{item.nome}</Text>
          <Text className="text-sm font-semibold text-gray-500">{item.categoria}</Text>
        </View>

        <View className={`px-3 py-1 rounded-full ${isCritical ? 'bg-red-100' : 'bg-green-100'}`}>
          <Text className={`text-xs font-bold ${isCritical ? 'text-red-700' : 'text-green-700'}`}>
            {isCritical ? 'Crítico' : 'Estável'}
          </Text>
        </View>
      </View>

      <Text className="text-gray-600 mb-1 mt-2">
        Estoque Atual: <Text className="font-bold">{item.quantidade_saldo}</Text>
      </Text>

      {item.quantidade_minima !== null && (
        <Text className="text-gray-500 text-sm mb-1">Mínimo: {item.quantidade_minima}</Text>
      )}

      {item.localizacao && (
        <Text className="text-gray-600 text-sm mb-2">
          Localização: <Text className="text-gray-500 text-sm">{item.localizacao}</Text>
        </Text>
      )}

      <View className="h-px bg-gray-200 my-2" />

      {item.categoria === 'REAGENTE' && item.reagenteInfo && (
        <View className="mt-2">
          <Text className="text-gray-600 text-sm">
            Fórmula: <Text className="font-bold">{item.reagenteInfo.formula}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Nº Cas: <Text className="font-bold">{item.reagenteInfo.cas}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Marca: <Text className="font-bold">{item.reagenteInfo.marca}</Text>
          </Text>
          {item.reagenteInfo.observacao && (
            <Text className="text-gray-600 text-sm mt-1">
              Obs: <Text className="italic">{item.reagenteInfo.observacao}</Text>
            </Text>
          )}
        </View>
      )}

      {item.categoria === 'SOLUCAO' && item.solucaoInfo && (
        <View className="mt-2">
          <Text className="text-gray-600 text-sm">
            Fórmula: <Text className="font-bold">{item.solucaoInfo.formula}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Nº Cas: <Text className="font-bold">{item.solucaoInfo.cas}</Text>
          </Text>
          {item.solucaoInfo.observacao && (
            <Text className="text-gray-600 text-sm mt-1">
              Obs: <Text className="italic">{item.solucaoInfo.observacao}</Text>
            </Text>
          )}
        </View>
      )}

      {item.categoria === 'VIDRARIA' && item.vidrariaInfo && (
        <View className="mt-2">
          <Text className="text-gray-600 text-sm">
            Marca: <Text className="font-bold">{item.vidrariaInfo.marca}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Capacidade: <Text className="font-bold">{item.vidrariaInfo.capacidade}</Text>
          </Text>
        </View>
      )}

      {item.categoria === 'EQUIPAMENTO' && item.equipamentoInfo && (
        <View className="mt-2">
          <Text className="text-gray-600 text-sm">
            Marca: <Text className="font-bold">{item.equipamentoInfo.marca}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Modelo: <Text className="font-bold">{item.equipamentoInfo.modelo}</Text>
          </Text>
          <Text className="text-gray-600 text-sm">
            Voltagem: <Text className="font-bold">{item.equipamentoInfo.voltagem}</Text>
          </Text>
        </View>
      )}
    </View>
  );
};
