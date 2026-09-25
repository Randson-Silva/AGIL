import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { getInventoryItems } from '../../../services/inventory.service';
import { InventoryItemCard } from '../../../components/inventory-item-card';

export default function InventoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const fetchInventory = async () => {
    try {
      const response = await getInventoryItems();
      setItems(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o inventário.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchInventory();
    }, []),
  );

  if (isLoading && items.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F4F7F4]">
        <Text className="text-gray-500 font-semibold">A carregar inventário...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F4F7F4]">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100, paddingTop: 20 }}
      >
        <Text className="text-2xl font-bold mt-6 mb-6 text-gray-900">Inventário Mestre</Text>

        {items.map((item) => (
          <InventoryItemCard key={item.id} item={item} />
        ))}
      </ScrollView>

      <View className="absolute bottom-0 w-full bg-white border-t border-gray-200 px-4 py-4 pb-8">
        <TouchableOpacity
          onPress={() => router.push('/new-item')}
          className="bg-green-700 rounded-lg p-4 items-center shadow-sm"
        >
          <Text className="text-white font-bold text-[16px]">Novo item no inventário</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
