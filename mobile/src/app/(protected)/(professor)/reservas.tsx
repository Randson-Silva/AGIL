import React from 'react';
import { View, ScrollView, ActivityIndicator, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { Button } from '../../../components/ui/Button';
import { FilterPills, FilterOption } from '../../../components/reservation/filter-pills';
import { ReservationCard } from '../../../components/reservation/reservation-card';
import { CancelReservationModal } from '../../../components/reservation/cancel-reservation-modal';
import { useReservas } from '../../../hooks/useReservas';

import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';

export default function ReservasScreen() {
  const {
    reservations,
    isLoading,
    activeFilter,
    setActiveFilter,
    isModalOpen,
    reservationToCancel,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    handleNewReservation,
    firstName,
    initials,
  } = useReservas();

  const FILTER_OPTIONS: FilterOption[] = ['Todas', 'Pendente', 'Aprovada', 'Encerradas'];

  const protocoloModal = reservationToCancel?.id
    ? `R-${reservationToCancel.id.substring(0, 4).toUpperCase()}`
    : 'R-XXXX';

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard 
        initials={initials} 
        title="Minhas Reservas" 
        icon={<Feather name="calendar" size={20} color="#FFF" />} 
        hasBorder
      />

      {/* Filtros */}
      <View className="mb-4">
        <FilterPills
          options={FILTER_OPTIONS}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
        />
      </View>

      {/* Lista de Reservas */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {reservations.length === 0 ? (
            <View className="items-center justify-center py-10 px-6">
              <Text className="text-gray-500 text-center">
                Nenhuma reserva encontrada para este filtro.
              </Text>
            </View>
          ) : (
            reservations.map((item) => (
              <ReservationCard
                key={item.id}
                item={item}
                onCancelPress={handleOpenCancelModal}
              />
            ))
          )}
        </ScrollView>
      )}

      {/* Botão Flutuante (Fixed at bottom via absolute if needed, or normal sticky) */}
      <View className="absolute bottom-6 left-6 right-6">
        <Button
          variant="primary"
          title="Nova reserva"
          onPress={handleNewReservation}
          icon={<Feather name="calendar" size={20} color="#FFF" />}
        />
      </View>

      {/* Modal de Cancelamento */}
      <CancelReservationModal
        visible={isModalOpen}
        reservationProtocol={protocoloModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </PageWrapper>
  );
}
