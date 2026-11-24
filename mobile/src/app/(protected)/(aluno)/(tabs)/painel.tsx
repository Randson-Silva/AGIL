import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { PageWrapper } from '../../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../../components/dashboard/header-dashboard';
import { ProfessorActionCard } from '../../../../components/dashboard/professor-action-card';
import { NextReservationCard } from '../../../../components/dashboard/next-reservation-card';
import { useAlunoDashboard } from '../../../../hooks/useAlunoDashboard';
import { OBJECTIVE_LABELS } from '../../../../utils/constants';
import { formatIsoDateToBr } from '../../../../utils/date-utils';

export default function AlunoPainelScreen() {
  const { firstName, initials, nextReservation, isLoading, actions } = useAlunoDashboard();

  if (isLoading) {
    return (
      <PageWrapper className="bg-[#F8FAF9]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      </PageWrapper>
    );
  }

  const formattedDate = nextReservation?.data_reserva
    ? (() => {
        const dateStr = formatIsoDateToBr(nextReservation.data_reserva);
        const firstSlot = nextReservation.horarios?.[0]?.hora_inicio;
        return firstSlot ? `${dateStr} · ${firstSlot}` : dateStr;
      })()
    : '';

  const classLabel = nextReservation?.objetivo
    ? OBJECTIVE_LABELS[nextReservation.objetivo] || nextReservation.objetivo
    : 'Reserva Confirmada';

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <HeaderDashboard userName={firstName} initials={initials} hasBorder />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        style={{ backgroundColor: '#F8FAF9' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      >
        <View className="px-6 flex-1 pt-6">
          <View className="mb-6 self-start">
            <View className="bg-emerald-100/50 px-3 py-1.5 rounded-full">
              <Text className="text-[#00623B] font-medium text-xs">Perfil: Aluno</Text>
            </View>
          </View>

          {nextReservation ? (
            <NextReservationCard
              title={nextReservation.local}
              dateStr={formattedDate}
              classNameLabel={classLabel}
            />
          ) : (
            <View className="bg-white rounded-[24px] p-6 mb-8 w-full shadow-sm border border-gray-100 items-center justify-center">
              <Text className="text-gray-500 font-medium text-sm text-center">
                Você não possui reservas futuras.
              </Text>
            </View>
          )}

          <Text className="text-xl font-bold text-gray-900 mb-4">O que você quer fazer?</Text>

          {actions.map((action) => (
            <ProfessorActionCard key={action.id} item={action} />
          ))}
        </View>
      </ScrollView>
    </PageWrapper>
  );
}
