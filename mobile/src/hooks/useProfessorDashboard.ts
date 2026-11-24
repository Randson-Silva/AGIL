import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ProfessorActionItem } from '../components/dashboard/professor-action-card';
import { getReservations } from '../services/reservation.service';
import { extractIsoDatePart, getLocalTodayIso } from '../utils/date-utils';
import { useAuth } from './useAuth';

const ACTIVE_RESERVATION_STATUSES = ['PENDENTE', 'AVISO_SIMPLES', 'APROVADA'];

export function useProfessorDashboard() {
  const { firstName, initials } = useAuth();
  const router = useRouter();

  const [nextReservation, setNextReservation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // useFocusEffect garante que a chamada ocorra toda vez que a tela ganha foco
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
            const todayIso = getLocalTodayIso();
            const upcoming = reservations
              .filter((r: any) => {
                const datePart = extractIsoDatePart(r.data_reserva);
                return (
                  ACTIVE_RESERVATION_STATUSES.includes(r.status) &&
                  Boolean(datePart && datePart >= todayIso)
                );
              })
              .sort(
                (a: any, b: any) =>
                  new Date(a.data_reserva).getTime() - new Date(b.data_reserva).getTime(),
              );

            if (upcoming.length > 0) {
              setNextReservation(upcoming[0]);
            } else {
              setNextReservation(null);
            }
          } else {
            setNextReservation(null);
          }
        } catch (error) {
          console.error('Erro ao buscar reservas do dashboard', error);
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
      id: 'reserva_lab',
      iconName: 'CalendarDaysIcon',
      label: 'Reservar laboratório',
      description: 'Escolha data, horário e finalidade',
      onPress: () => router.push('/(protected)/(professor)/new-reservation'),
    },
    {
      id: 'consultar_disp',
      iconName: 'CalendarDaysIcon',
      label: 'Consultar disponibilidade',
      description: 'Agenda com horários livres e reservados',
      onPress: () => router.push('/(protected)/(professor)/availability'),
    },
    {
      id: 'registrar_ata',
      iconName: 'DocumentTextIcon',
      label: 'Registrar ata de aula',
      description: 'Relate o que aconteceu na aula prática',
      onPress: () => console.log('debug: clicou registrar ata (campo a ser removido futuramente)'),
    },
    {
      id: 'solicitar_materiais',
      iconName: 'CubeIcon',
      label: 'Solicitar materiais',
      description: 'Monte sua cesta e defina o prazo',
      onPress: () => router.push('/(protected)/(professor)/(tabs)/materiais'),
    },
    {
      id: 'reportar_avaria',
      iconName: 'ExclamationTriangleIcon',
      label: 'Reportar avaria',
      description: 'Quebra, defeito ou contaminação',
      onPress: () => router.push('/(protected)/(professor)/report-breakdown'),
    },
    {
      id: 'minhas_reservas',
      iconName: 'ClipboardDocumentListIcon',
      label: 'Minhas reservas',
      description: 'Acompanhe status e cancele',
      onPress: () => router.push('/(protected)/(professor)/(tabs)/reservas'),
    },
    {
      id: 'meu_historico',
      iconName: 'ClockIcon',
      label: 'Meu histórico',
      description: 'Uso por período e material',
      onPress: () => router.push('/(protected)/(professor)/historico'),
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
