import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { HeaderDashboard } from '../../../../components/dashboard/header-dashboard';
import { CancelReservationModal } from '../../../../components/reservation/cancel-reservation-modal';
import { FilterOption, FilterPills } from '../../../../components/reservation/filter-pills';
import { ReservationCard } from '../../../../components/reservation/reservation-card';
import { Button } from '../../../../components/ui/Button';
import { PageWrapper } from '../../../../components/ui/page-wrapper';
import { useReservas } from '../../../../hooks/useReservas';
import { formatReservationProtocol } from '../../../../utils/protocol.utils';

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

  const router = useRouter();

  const FILTER_OPTIONS: FilterOption[] = ['Todas', 'Pendente', 'Aprovada', 'Encerradas'];

  const protocoloModal = formatReservationProtocol(reservationToCancel?.id);

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard
        userName={firstName}
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
                onSendUsageLog={(res) => {
                  router.push({
                    pathname: '/(protected)/(professor)/(tabs)/ata-form',
                    params: { reservation: JSON.stringify(res), usageLog: '' },
                  });
                }}
                onViewUsageLog={(res) =>
                  router.push({
                    pathname: '/(protected)/(professor)/(tabs)/ata-relatorio',
                    params: { reservationId: res.id },
                  })
                }
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
