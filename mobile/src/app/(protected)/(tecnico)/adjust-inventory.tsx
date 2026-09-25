import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Toast from 'react-native-toast-message';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';

import { incrementInventoryStock, decrementInventoryStock } from '../../../services/inventory.service';
import { useAuth } from '@/hooks/useAuth';

const UNIT_LABELS: Record<string, string> = {
  MG: 'mg', G: 'g', KG: 'kg', ML: 'ml', L: 'L', UN: 'unidades',
};

export default function AdjustStockScreen() {
  const {user} = useAuth();
  const router = useRouter();
  const { itemData } = useLocalSearchParams();

  const [itemId, setItemId] = useState('');
  const [name, setName] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(0);
  const [minQuantity, setMinQuantity] = useState<number | null>(null);
  const [measurementUnit, setMeasurementUnit] = useState('UN');

  const [adjustmentValue, setAdjustmentValue] = useState('');

  useEffect(() => {
    if (itemData) {
      const parsed = JSON.parse(itemData as string);
      setItemId(parsed.id);
      setName(parsed.nome);
      setCurrentQuantity(parsed.quantidade_saldo);
      setMinQuantity(parsed.quantidade_minima);
      setMeasurementUnit(UNIT_LABELS[parsed.tipo_medida] || parsed.tipo_medida);
    }
  }, [itemData]);

  const handleIncrement = async () => {
    const amount = Number(adjustmentValue);
    if (!amount || amount <= 0) {
      Toast.show({ type: 'error', text1: 'Valor inválido', text2: 'Insira um número maior que zero.' });
      return;
    }

    try {
      await incrementInventoryStock(itemId, amount);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: `Entrada de ${amount} registada.` });
      router.back();
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível atualizar o estoque.' });
    }
  };

  const handleDecrement = async () => {
    const amount = Number(adjustmentValue);
    if (!amount || amount <= 0) {
      Toast.show({ type: 'error', text1: 'Valor inválido', text2: 'Insira um número maior que zero.' });
      return;
    }

    try {
      await decrementInventoryStock(itemId, amount);
      Toast.show({ type: 'success', text1: 'Sucesso', text2: `Saída de ${amount} registada.` });
      router.back();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        Toast.show({ type: 'error', text1: 'Atenção', text2: error.response.data.message });
      } else {
        Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível atualizar o estoque.' });
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={{ backgroundColor: '#F4F7F4' }}
      contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={Platform.OS === 'ios' ? 20 : 40}
    >
      <Text className="text-2xl font-bold mt-2 mb-8 text-gray-800">Ajustar Estoque</Text>

      <View className="bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">
        <Text className="text-[17px] font-extrabold text-gray-900 mb-6">{name}</Text>

        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-xs font-bold text-gray-400 tracking-wider mb-1">ESTOQUE ATUAL</Text>
            <Text className="text-3xl font-extrabold text-gray-900">
              {currentQuantity} <Text className="text-base font-medium text-gray-500">{measurementUnit}</Text>
            </Text>
          </View>

          <View className="items-end">
            <Text className="text-xs font-bold text-gray-400 tracking-wider mb-1">MÍNIMO</Text>
            <Text className="text-xl font-bold text-gray-800">
              {minQuantity !== null ? minQuantity : '-'}
            </Text>
          </View>
        </View>
      </View>

      <Text className="text-sm font-semibold mb-3 text-gray-600 text-center">
        Digite a quantidade para adicionar ou remover:
      </Text>

      <View className="items-center mb-10">
        <TextInput
          value={adjustmentValue}
          onChangeText={setAdjustmentValue}
          keyboardType="numeric"
          placeholder="0"
          className="text-center text-4xl font-extrabold text-gray-900 w-32 h-20 border-b-2 border-gray-300"
          maxLength={5}
        />
        <Text className="text-gray-500 font-medium mt-2">{measurementUnit}</Text>
      </View>

      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={handleDecrement}
          className="flex-1 bg-red-100 border border-red-200 rounded-lg py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-red-700 font-bold text-lg">- Remover</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleIncrement}
          className="flex-1 bg-green-100 border border-green-200 rounded-lg py-4 items-center justify-center shadow-sm"
        >
          <Text className="text-green-800 font-bold text-lg">+ Adicionar</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAwareScrollView>
  );
}