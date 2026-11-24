import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { FilterOption } from '../components/reservation/filter-pills';
import { getReservations, ReservationItem } from '../services/reservation.service';
import { useAuth } from './useAuth';

export function useReservas() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Todas');

  // Controle de Modal
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
          console.error('Erro ao buscar reservas:', error);
          if (isActive) {
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Não foi possível buscar as reservas.',
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
    if (activeFilter === 'Todas') return true;
    if (activeFilter === 'Pendente') {
      return res.status === 'PENDENTE' || res.status === 'AVISO_SIMPLES';
    }
    if (activeFilter === 'Aprovada') {
      return res.status === 'APROVADA';
    }
    if (activeFilter === 'Encerradas') {
      return (
        res.status === 'CANCELADA' ||
        res.status === 'REJEITADA' ||
        res.status === 'CONCLUIDA_COM_ATA'
      );
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
    // Como a API não tem rota de DELETE/PATCH cancel, fazemos apenas mock UI
    if (!reservationToCancel) return;

    Toast.show({
      type: 'info',
      text1: 'Em construção',
      text2: 'O backend não suporta cancelamento no momento.',
    });

    // Mock: atualizar estado local para fingir o cancelamento
    setReservations((prev) =>
      prev.map((r) => (r.id === reservationToCancel.id ? { ...r, status: 'CANCELADA' } : r)),
    );

    handleCloseCancelModal();
  };

  const handleNewReservation = () => {
    router.push('/(protected)/(professor)/new-reservation');
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
