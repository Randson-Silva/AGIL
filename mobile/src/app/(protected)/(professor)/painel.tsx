import { ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { PageWrapper } from '../../../components/ui/page-wrapper';
import { HeaderDashboard } from '../../../components/dashboard/header-dashboard';
import { ProfessorActionCard } from '../../../components/dashboard/professor-action-card';
import { NextReservationCard } from '../../../components/dashboard/next-reservation-card';
import { useProfessorDashboard } from '../../../hooks/useProfessorDashboard';

export default function ProfessorPainelScreen() {
  const { firstName, initials, nextReservation, isLoading, actions } = useProfessorDashboard();

  if (isLoading) {
    return (
      <PageWrapper className="bg-[#F8FAF9]">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#00623B" />
        </View>
      </PageWrapper>
    );
  }

  // Formatador simples para mock e UI
  const formatDateTime = (isoDate: string) => {
    try {
      const d = new Date(isoDate);
      if (isNaN(d.getTime())) return isoDate;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const mins = String(d.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} · ${hours}:${mins}`;
    } catch {
      return isoDate;
    }
  };

  const formattedDate = nextReservation?.data_reserva 
    ? formatDateTime(nextReservation.data_reserva) 
    : '';

  return (
    <PageWrapper className="bg-[#F8FAF9]">
      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        style={{ backgroundColor: '#F8FAF9' }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
      >
        <HeaderDashboard userName={firstName} initials={initials} />

        <View className="px-6 flex-1">
          {/* Badge Perfil: Professor */}
          <View className="mb-6 self-start">
            <View className="bg-emerald-100/50 px-3 py-1.5 rounded-full">
              <Text className="text-[#00623B] font-medium text-xs">
                Perfil: Professor
              </Text>
            </View>
          </View>

          {/* Próxima Reserva ou Vazio */}
          {nextReservation ? (
            <NextReservationCard 
              title={nextReservation.local}
              dateStr={formattedDate}
              classNameLabel={nextReservation.objetivo || 'Reserva Confirmada'}
            />
          ) : (
            <View className="bg-white rounded-[24px] p-6 mb-8 w-full shadow-sm border border-gray-100 items-center justify-center">
              <Text className="text-gray-500 font-medium text-sm text-center">
                Você não possui reservas futuras.
              </Text>
            </View>
          )}

          {/* O que você quer fazer? */}
          <Text className="text-xl font-bold text-gray-900 mb-4">
            O que você quer fazer?
          </Text>

          {/* Cards de Ação */}
          {actions.map((action) => (
            <ProfessorActionCard key={action.id} item={action} />
          ))}

        </View>
      </ScrollView>
    </PageWrapper>
  );
}
