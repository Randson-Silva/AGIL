import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { CubeIcon } from 'react-native-heroicons/outline';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { CatalogItemCard } from '../../../components/reservation/catalog-item-card';
import { RequestHistoryCard } from '../../../components/reservation/request-history-card';
import { CalendarModal } from '../../../components/reservation/calendar-modal';
import { useMateriais } from '../../../hooks/useMateriais';
import { Feather } from '@expo/vector-icons';

export default function MateriaisScreen() {
  const {
    firstName,
    initials,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    cart,
    handleIncrement,
    handleDecrement,
    paginatedCatalog,
    catalogPage,
    setCatalogPage,
    totalCatalogPages,
    withdrawalDate,
    setWithdrawalDate,
    returnDate,
    setReturnDate,
    calendarType,
    setCalendarType,
    handleDateSelect,
    paginatedHistory,
    historyPage,
    setHistoryPage,
    totalHistoryPages,
    handleSubmit
  } = useMateriais();

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        initials={initials}
        title="Materiais"
        icon={<CubeIcon size={20} color="#FFF" />}
        hasBorder
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Search */}
        <View className="px-6 mt-2 mb-4">
          <Input
            label="Buscar material"
            iconName="search"
            placeholder="Nome do material..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Catalog */}
        <View className="mb-4">
          {paginatedCatalog.length > 0 ? (
            paginatedCatalog.map((item) => (
              <CatalogItemCard
                key={item.id}
                item={item}
                quantity={cart[item.id] || 0}
                onIncrement={() => handleIncrement(item.id)}
                onDecrement={() => handleDecrement(item.id)}
              />
            ))
          ) : (
            <Text className="text-gray-500 text-center mx-6">Nenhum material encontrado.</Text>
          )}

          {/* Catalog Pagination */}
          {totalCatalogPages > 1 && (
            <View className="flex-row items-center justify-between px-6 mt-2">
              <TouchableOpacity
                onPress={() => setCatalogPage(Math.max(1, catalogPage - 1))}
                disabled={catalogPage === 1}
                className={`p-2 rounded-full ${catalogPage === 1 ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-left" size={24} color="#00623B" />
              </TouchableOpacity>
              <Text className="text-sm text-gray-600">
                Página {catalogPage} de {totalCatalogPages}
              </Text>
              <TouchableOpacity
                onPress={() => setCatalogPage(Math.min(totalCatalogPages, catalogPage + 1))}
                disabled={catalogPage === totalCatalogPages}
                className={`p-2 rounded-full ${catalogPage === totalCatalogPages ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-right" size={24} color="#00623B" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Dates Section */}
        <View className="px-6 mb-8 mt-4">
          <Text className="text-lg font-bold text-gray-900 mb-4">Prazo de Retirada e Devolução</Text>
          <View className="mb-2">
            <Input
              label="Data de Retirada"
              iconName="edit-2"
              rightIconName="calendar"
              onRightIconPress={() => setCalendarType('withdrawal')}
              placeholder="YYYY-MM-DD"
              value={withdrawalDate}
              onChangeText={setWithdrawalDate}
            />
          </View>
          <View>
            <Input
              label="Data de Devolução"
              iconName="edit-2"
              rightIconName="calendar"
              onRightIconPress={() => setCalendarType('return')}
              placeholder="YYYY-MM-DD"
              value={returnDate}
              onChangeText={setReturnDate}
            />
          </View>
        </View>

        {/* History */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-gray-900 mx-6 mb-4">Minhas Solicitações</Text>
          {paginatedHistory.length > 0 ? (
            paginatedHistory.map((item) => (
              <RequestHistoryCard key={item.id} item={item} />
            ))
          ) : (
            <Text className="text-gray-500 text-center mx-6">Você não tem solicitações.</Text>
          )}

          {/* History Pagination */}
          {totalHistoryPages > 1 && (
            <View className="flex-row items-center justify-between px-6 mt-2">
              <TouchableOpacity
                onPress={() => setHistoryPage(Math.max(1, historyPage - 1))}
                disabled={historyPage === 1}
                className={`p-2 rounded-full ${historyPage === 1 ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-left" size={24} color="#00623B" />
              </TouchableOpacity>
              <Text className="text-sm text-gray-600">
                Página {historyPage} de {totalHistoryPages}
              </Text>
              <TouchableOpacity
                onPress={() => setHistoryPage(Math.min(totalHistoryPages, historyPage + 1))}
                disabled={historyPage === totalHistoryPages}
                className={`p-2 rounded-full ${historyPage === totalHistoryPages ? 'opacity-50' : ''}`}
              >
                <Feather name="chevron-right" size={24} color="#00623B" />
              </TouchableOpacity>
            </View>
          )}
        </View>

      </ScrollView>

      {/* Sticky Confirm Button */}
      {Object.keys(cart).length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 shadow-lg">
          <Button
            title="Confirmar Solicitação"
            isLoading={isSubmitting}
            onPress={handleSubmit}
            variant="primary"
          />
        </View>
      )}

      {/* Modal de Calendário */}
      <CalendarModal
        visible={calendarType !== null}
        onClose={() => setCalendarType(null)}
        selectedDate={calendarType === 'withdrawal' ? withdrawalDate : returnDate}
        onSelectDate={handleDateSelect}
      />

    </PageWrapper>
  );
}
