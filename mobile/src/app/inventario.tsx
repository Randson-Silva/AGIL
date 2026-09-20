import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function InventarioScreen() {
  const [itens, setItens] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(true);

  const router = useRouter();

  const buscarInsumos = async () => {
    try {
      const response = await axios.get('http://192.168.0.5:3000/inventory/insumos');
      setItens(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o inventário.');
      console.error(error);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarInsumos();
  }, []);

  if (carregando) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>A carregar inventário...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-6 text-gray-800">Inventário Mestre</Text>

      <TouchableOpacity
        onPress={() => router.push('/novo-item')}
        className="bg-green-600 rounded-lg p-4 items-center mb-6 shadow-sm"
      >
        <Text className="text-white font-bold text-lg">+ Novo item no inventário</Text>
      </TouchableOpacity>

      {itens.map((item) => (
        <View key={item.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
          <View className="flex-row justify-between mb-2">
            <Text className="font-bold text-lg text-gray-800">{item.nome}</Text>
            <Text className="text-sm font-semibold text-green-600">{item.categoria}</Text>
          </View>

          <Text className="text-gray-600 mb-1">
            Estoque Atual: <Text className="font-bold">{item.quantidade_saldo}</Text>
          </Text>

          {item.localizacao && (
            <Text className="text-gray-600 text-sm">
              Localização: <Text className="text-gray-500 text-sm">{item.localizacao}</Text>
            </Text>
          )}

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
              <Text className="text-gray-600 text-sm">
                Observação: <Text className="font-bold">{item.reagenteInfo.observacao}</Text>
              </Text>
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
              <Text className="text-gray-600 text-sm">
                Observação: <Text className="font-bold">{item.solucaoInfo.observacao}</Text>
              </Text>
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
      ))}
    </ScrollView>
  );
}
