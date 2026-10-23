import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Feather, FontAwesome5 } from '@expo/vector-icons';

import { InventoryItemCard } from '../../../components/inventory/inventory-item-card';
import { InventoryFilterBar } from '../../../components/inventory/inventory-filter-bar';
import { useInventory } from '../../../hooks/useInventory';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { BackButton } from '../../../components/ui/Back-button';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';

export default function InventoryScreen() {
  const router = useRouter();
  const {
    items,
    isLoading,
    filters,
    isSearchOpen,
    handleToggleSearch,
    handleClearSearch,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    criticalItemsCount,
    fetchInventory,
    firstName,
    initials,
  } = useInventory();

  useFocusEffect(
    useCallback(() => {
      fetchInventory();
    }, [fetchInventory]),
  );

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
        initials={initials}
        title="Inventário Mestre"
        icon={<FontAwesome5 name="flask" size={18} color="#FFF" />}
        hasBorder
      />

      {/* Topo Fixo: Voltar + Novo Item (Lado a Lado) e Barra de Busca/Filtros */}
      <View className="bg-[#F8FAF9] pt-4 pb-1">
        <View className="flex-row items-center gap-3 px-6 mb-3">
          <BackButton />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/new-item')}
            className="flex-1 h-12 bg-[#00623B] rounded-xl px-4 items-center flex-row justify-center shadow-sm"
          >
            <Feather name="plus" size={18} color="#FFF" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-sm">Novo item no inventário</Text>
          </TouchableOpacity>
        </View>

        <InventoryFilterBar
          filters={filters}
          activeFilter={activeFilter}
          onSelectFilter={setActiveFilter}
          criticalItemsCount={criticalItemsCount}
          isSearchOpen={isSearchOpen}
          onToggleSearch={handleToggleSearch}
          searchQuery={searchQuery}
          onChangeSearchQuery={setSearchQuery}
          onClearSearch={handleClearSearch}
        />
      </View>

      {/* Lista de Insumos */}
      <View className="flex-1 bg-[#F8FAF9]">
        {isLoading && items.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500 font-semibold">A carregar inventário...</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 24 }}
          >
            {items.length > 0 ? (
              items.map((item) => <InventoryItemCard key={item.id} item={item} />)
            ) : (
              <Text className="text-base font-semibold text-center mt-10 text-gray-500">
                Nenhum item encontrado
              </Text>
            )}
          </ScrollView>
        )}
      </View>.
    </PageWrapper>
  );
}
