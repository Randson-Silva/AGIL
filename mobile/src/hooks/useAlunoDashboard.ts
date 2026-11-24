import { useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { getReservations, ReservationItem } from '../services/reservation.service';
import { ProfessorActionItem } from '../components/dashboard/professor-action-card';

const ACTIVE_RESERVATION_STATUSES = ['PENDENTE', 'AVISO_SIMPLES', 'APROVADA'];

export function useAlunoDashboard() {
  const { firstName, initials } = useAuth();
  const router = useRouter();

  const [nextReservation, setNextReservation] = useState<ReservationItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchDashboardData = async () => {
        try {
          setIsLoading(true);
          const res = await getReservations();
          const reservations = res.data;

          if (!isActive) return;

          if (reservations && reservations.length > 0) {
            const todayIso = new Date().toISOString().split('T')[0];
            const upcoming = reservations
              .filter(
                (r) =>
                  ACTIVE_RESERVATION_STATUSES.includes(r.status) &&
                  r.data_reserva.split('T')[0] >= todayIso,
              )
              .sort(
                (a, b) =>
                  new Date(a.data_reserva).getTime() - new Date(b.data_reserva).getTime(),
              );

            setNextReservation(upcoming.length > 0 ? upcoming[0] : null);
          } else {
            setNextReservation(null);
          }
        } catch (error) {
          console.error('Erro ao buscar reservas do dashboard do aluno:', error);
          if (isActive) {
            setNextReservation(null);
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchDashboardData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const actions: ProfessorActionItem[] = [
    {
      id: 'consultar_disp',
      iconName: 'CalendarDaysIcon',
      label: 'Consultar disponibilidade',
      description: 'Agenda com horários livres e reservados',
      onPress: () => router.push('/(protected)/(aluno)/availability'),
    },
    {
      id: 'reserva_lab',
      iconName: 'CalendarDaysIcon',
      label: 'Reservar laboratório',
      description: 'Escolha data, horário e finalidade (Pesquisa ou TCC)',
      onPress: () => router.push('/(protected)/(aluno)/new-reservation'),
    },
    {
      id: 'reportar_avaria',
      iconName: 'ExclamationTriangleIcon',
      label: 'Reportar avaria',
      description: 'Quebra, defeito ou contaminação',
      onPress: () => router.push('/(protected)/(aluno)/(tabs)/avarias'),
    },
    {
      id: 'historico_avarias',
      iconName: 'ClipboardDocumentListIcon',
      label: 'Histórico de avarias',
      description: 'Acompanhe seus reportes enviados',
      onPress: () =>
        router.push({
          pathname: '/(protected)/(aluno)/historico',
          params: { initialMode: 'AVARIAS' },
        }),
    },
    {
      id: 'historico_uso',
      iconName: 'ClockIcon',
      label: 'Histórico de uso',
      description: 'Uso por período e material',
      onPress: () =>
        router.push({
          pathname: '/(protected)/(aluno)/historico',
          params: { initialMode: 'MATERIAIS' },
        }),
    },
  ];

  return {
    firstName,
    initials,
    nextReservation,
    isLoading,
    actions,
  };
}
