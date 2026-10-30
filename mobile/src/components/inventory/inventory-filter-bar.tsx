import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { InventoryFilter } from '../../hooks/useInventory';

interface InventoryFilterBarProps {
  filters: InventoryFilter[];
  activeFilter: InventoryFilter;
  onSelectFilter: (filter: InventoryFilter) => void;
  criticalItemsCount: number;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  searchQuery: string;
  onChangeSearchQuery: (text: string) => void;
  onClearSearch: () => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  filters,
  activeFilter,
  onSelectFilter,
  criticalItemsCount,
  isSearchOpen,
  onToggleSearch,
  searchQuery,
  onChangeSearchQuery,
  onClearSearch,
}) => {
  const hasCriticalItems = criticalItemsCount > 0;
  const isSearchActive = isSearchOpen || searchQuery.trim().length > 0;

  return (
    <View className="pb-2">
      {/* Linha de Lupa + Pills de Filtro */}
      <View className="flex-row items-center pl-6">
        <TouchableOpacity
          onPress={onToggleSearch}
          activeOpacity={0.7}
          className={`w-9 h-9 rounded-full items-center justify-center mr-2 border ${
            isSearchActive
              ? 'bg-[#E8F3EE] border-[#00623B]'
              : 'bg-transparent border-transparent'
          }`}
        >
          <Feather
            name="search"
            size={20}
            color={isSearchActive ? '#00623B' : '#4B5563'}
          />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingRight: 24, gap: 8, paddingVertical: 4 }}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            const isCritical = filter === 'Alerta Crítico';

            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.7}
                onPress={() => onSelectFilter(filter)}
                className={`flex-row items-center px-4 py-2 rounded-full border ${
                  isActive
                    ? 'bg-[#00623B] border-[#00623B]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <Text
                  className={`font-semibold text-xs ${
                    isActive ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {filter}
                </Text>

                {isCritical && hasCriticalItems && (
                  <View
                    className={`w-2 h-2 rounded-full ml-1.5 ${
                      isActive ? 'bg-red-400 border border-white' : 'bg-red-500'
                    }`}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Caixa de Busca Expansível */}
      {isSearchOpen && (
        <View className="px-6 mt-2.5">
          <View className="flex-row items-center bg-white border border-gray-300 rounded-2xl px-3.5 h-11 shadow-sm">
            <Feather name="search" size={16} color="#6B7280" />
            <TextInput
              autoFocus
              value={searchQuery}
              onChangeText={onChangeSearchQuery}
              placeholder="Buscar insumo, CAS ou localização..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-2.5 text-sm text-gray-900"
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={onClearSearch}
              activeOpacity={0.7}
              className="p-1"
            >
              <Feather name="x" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};
