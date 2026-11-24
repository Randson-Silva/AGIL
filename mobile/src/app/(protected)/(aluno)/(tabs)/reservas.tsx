import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { HeaderDashboard } from '../../../../components/dashboard/header-dashboard';
import { CancelReservationModal } from '../../../../components/reservation/cancel-reservation-modal';
import { FilterPills } from '../../../../components/reservation/filter-pills';
import { ReservationCard } from '../../../../components/reservation/reservation-card';
import { BackButton } from '../../../../components/ui/Back-button';
import { Button } from '../../../../components/ui/Button';
import { PageWrapper } from '../../../../components/ui/page-wrapper';
import { AlunoReservaFilter, useAlunoReservas } from '../../../../hooks/useAlunoReservas';
import { formatReservationProtocol } from '../../../../utils/protocol.utils';

const ALUNO_FILTER_OPTIONS: AlunoReservaFilter[] = [
  'Todos',
  'Pendente',
  'Aprovada',
  'Rejeitada',
  'Cancelada',
];

export default function AlunoReservasScreen() {
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
  } = useAlunoReservas();

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

      <View className="px-6 pt-3">
        <BackButton />
      </View>

      <View className="mb-2">
        <FilterPills
          options={ALUNO_FILTER_OPTIONS}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
        />
      </View>

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

      <View className="absolute bottom-6 left-6 right-6">
        <Button
          variant="primary"
          title="Nova reserva"
          onPress={handleNewReservation}
          icon={<Feather name="calendar" size={20} color="#FFF" />}
        />
      </View>

      <CancelReservationModal
        visible={isModalOpen}
        reservationProtocol={protocoloModal}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancel}
      />
    </PageWrapper>
  );
}
