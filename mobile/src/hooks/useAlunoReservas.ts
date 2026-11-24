import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getReservations, ReservationItem } from '../services/reservation.service';
import { useAuth } from './useAuth';

export type AlunoReservaFilter =
  | 'Todos'
  | 'Pendente'
  | 'Aprovada'
  | 'Rejeitada'
  | 'Cancelada';

export function useAlunoReservas() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<AlunoReservaFilter>('Todos');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<ReservationItem | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchReservations = async () => {
        try {
          setIsLoading(true);
          const res = await getReservations();
          if (isActive) {
            setReservations(res.data || []);
          }
        } catch (error) {
          console.error('Erro ao buscar reservas do aluno:', error);
          if (isActive) {
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Não foi possível buscar suas reservas.',
            });
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchReservations();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const filteredReservations = reservations.filter((res) => {
    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Pendente') {
      return res.status === 'PENDENTE' || res.status === 'AVISO_SIMPLES';
    }
    if (activeFilter === 'Aprovada') {
      return res.status === 'APROVADA';
    }
    if (activeFilter === 'Rejeitada') {
      return res.status === 'REJEITADA';
    }
    if (activeFilter === 'Cancelada') {
      return res.status === 'CANCELADA';
    }
    return true;
  });

  const handleOpenCancelModal = (item: ReservationItem) => {
    setReservationToCancel(item);
    setIsModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    setReservationToCancel(null);
    setIsModalOpen(false);
  };

  const handleConfirmCancel = () => {
    if (!reservationToCancel) return;

    Toast.show({
      type: 'info',
      text1: 'Em construção',
      text2: 'O backend não suporta cancelamento no momento.',
    });

    setReservations((prev) =>
      prev.map((r) => (r.id === reservationToCancel.id ? { ...r, status: 'CANCELADA' } : r)),
    );

    handleCloseCancelModal();
  };

  const handleNewReservation = () => {
    router.push('/(protected)/(aluno)/new-reservation');
  };

  return {
    reservations: filteredReservations,
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
  };
}
