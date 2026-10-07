import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getReservations } from '../services/reservation.service';
import { FilterOption } from '../components/reservation/filter-pills';
import { useAuth } from './useAuth';

export function useReservas() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterOption>('Todas');

  // Controle de Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<any>(null);

  const getInitials = () => {
    if (!user?.name) return 'US';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

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
    }, [])
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
      return res.status === 'CANCELADA' || res.status === 'REJEITADA';
    }
    return true;
  });

  const handleOpenCancelModal = (item: any) => {
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
      prev.map((r) =>
        r.id === reservationToCancel.id ? { ...r, status: 'CANCELADA' } : r
      )
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
    initials: getInitials(),
  };
}
