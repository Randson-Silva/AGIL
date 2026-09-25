import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { InventoryItemCard } from '../../components/inventory-item-card';
import { getInventoryItems } from '../../services/inventory.service';

export default function InventoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  const fetchInventory = async () => {
    try {
      const response = await getInventoryItems();
      setItems(response.data);
    } catch (error) {
      Alert.alert('Error', 'Não foi possível carregar o inventário.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text>A carregar inventário...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mt-6 mb-6 text-gray-800">Inventário Mestre</Text>

      <TouchableOpacity
        onPress={() => router.push('/new-item')}
        className="bg-green-700 rounded-lg p-4 items-center mb-6 shadow-sm"
      >
        <Text className="text-white font-bold text-lg">+ Novo item no inventário</Text>
      </TouchableOpacity>

      {items.map((item) => (
        <InventoryItemCard key={item.id} item={item} />
      ))}
    </ScrollView>
  );
}
