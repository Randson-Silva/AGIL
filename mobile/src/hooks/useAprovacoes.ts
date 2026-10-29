import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import Toast from 'react-native-toast-message';
import {
  approveMaterialRequest,
  confirmMaterialReturn,
  listMaterialRequests,
  rejectMaterialRequest,
  MaterialRequestResponse,
} from '../services/material-request.service';
import {
  approveReservation,
  getReservations,
  registerReservationAbsence,
  rejectReservation,
  ReservationItem,
} from '../services/reservation.service';
import { ApprovalTabOption } from '../components/approvals/approval-tabs';

type RejectTarget =
  | { type: 'RESERVA'; item: ReservationItem }
  | { type: 'MATERIAL'; item: MaterialRequestResponse }
  | null;

function unwrapResponse<T>(response: { data: T | { data?: T } }): T {
  const data = response.data;
  if (
    data &&
    typeof data === 'object' &&
    'data' in data &&
    Array.isArray(data.data)
  ) {
    return data.data as T;
  }
  return data as T;
}

function reservationDate(item: ReservationItem): string {
  return item.data_reserva.split('T')[0];
}

function localDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;
}

function isStartedToday(item: ReservationItem, now: Date): boolean {
  if (reservationDate(item) !== localDate(now)) return false;
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes(),
  ).padStart(2, '0')}`;
  return item.horarios.some((slot) => slot.hora_inicio <= currentTime);
}

function showError(message: string) {
  Toast.show({ type: 'error', text1: 'Erro', text2: message });
}

export function useAprovacoes() {
  const [activeTab, setActiveTab] = useState<ApprovalTabOption>('RESERVAS');
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<
    MaterialRequestResponse[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [rejectTarget, setRejectTarget] = useState<RejectTarget>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const setProcessing = (id: string, processing: boolean) => {
    setProcessingIds((current) => {
      const next = new Set(current);
      if (processing) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    const [reservationsResult, materialsResult] = await Promise.allSettled([
      getReservations(),
      listMaterialRequests(),
    ]);

    if (reservationsResult.status === 'fulfilled') {
      const data = unwrapResponse<ReservationItem[]>(reservationsResult.value);
      setReservations(Array.isArray(data) ? data : []);
    } else {
      console.error('Erro ao buscar reservas para aprovação:', reservationsResult.reason);
      setReservations([]);
      showError('Não foi possível buscar as reservas.');
    }

    if (materialsResult.status === 'fulfilled') {
      const data = unwrapResponse<MaterialRequestResponse[]>(
        materialsResult.value,
      );
      setMaterialRequests(Array.isArray(data) ? data : []);
    } else {
      console.error(
        'Erro ao buscar solicitações de materiais para aprovação:',
        materialsResult.reason,
      );
      setMaterialRequests([]);
      showError('Não foi possível buscar as solicitações de materiais.');
    }

    setIsLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      fetchApprovals().catch((error) => {
        console.error('Erro ao carregar aprovações:', error);
        if (isActive) showError('Não foi possível carregar as aprovações.');
      });
      return () => {
        isActive = false;
      };
    }, [fetchApprovals]),
  );

  const pendingReservations = useMemo(
    () =>
      reservations.filter(
        (item) => item.status === 'PENDENTE' || item.status === 'AVISO_SIMPLES',
      ),
    [reservations],
  );

  const todayConfirmedReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter(
      (item) => item.status === 'APROVADA' && isStartedToday(item, now),
    );
  }, [reservations]);

  const approvedReservations = useMemo(
    () => reservations.filter((item) => item.status === 'APROVADA'),
    [reservations],
  );

  const pendingMaterialRequests = useMemo(
    () => materialRequests.filter((item) => item.status === 'PENDENTE'),
    [materialRequests],
  );

  const withdrawnMaterialRequests = useMemo(
    () => materialRequests.filter((item) => item.status === 'APROVADA'),
    [materialRequests],
  );

  const handleApproveReservation = async (id: string) => {
    setProcessing(id, true);
    try {
      await approveReservation(id);
      setReservations((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: 'APROVADA' } : item,
        ),
      );
      Toast.show({ type: 'success', text1: 'Reserva aprovada.' });
    } catch (error) {
      console.error('Erro ao aprovar reserva:', error);
      showError('Não foi possível aprovar a reserva.');
    } finally {
      setProcessing(id, false);
    }
  };

  const handleRegisterAbsence = async (id: string) => {
    setProcessing(id, true);
    try {
      await registerReservationAbsence(id);
      setReservations((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: 'REJEITADA' } : item,
        ),
      );
      Toast.show({ type: 'success', text1: 'Ausência registrada.' });
    } catch (error) {
      console.error('Erro ao registrar ausência:', error);
      showError('Não foi possível registrar a ausência.');
    } finally {
      setProcessing(id, false);
    }
  };

  const handleReallocatePress = () => {
    Toast.show({
      type: 'info',
      text1: 'Em construção',
      text2: 'A realocação de reservas estará disponível em breve.',
    });
  };

  const handleApproveMaterial = async (id: string) => {
    setProcessing(id, true);
    try {
      await approveMaterialRequest(id);
      setMaterialRequests((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: 'APROVADA' } : item,
        ),
      );
      Toast.show({ type: 'success', text1: 'Solicitação aprovada.' });
    } catch (error) {
      console.error('Erro ao aprovar solicitação de material:', error);
      showError('Não foi possível aprovar a solicitação.');
    } finally {
      setProcessing(id, false);
    }
  };

  const handleConfirmReturn = async (id: string) => {
    setProcessing(id, true);
    try {
      await confirmMaterialReturn(id);
      setMaterialRequests((items) =>
        items.map((item) =>
          item.id === id ? { ...item, status: 'DEVOLVIDA' } : item,
        ),
      );
      Toast.show({ type: 'success', text1: 'Devolução confirmada.' });
    } catch (error) {
      console.error('Erro ao confirmar devolução:', error);
      showError('Não foi possível confirmar a devolução.');
    } finally {
      setProcessing(id, false);
    }
  };

  const openRejectModal = (target: RejectTarget) => {
    setRejectTarget(target);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isRejecting) return;
    setRejectTarget(null);
    setRejectReason('');
  };

  const confirmReject = async () => {
    if (!rejectTarget) return;
    const reason = rejectReason.trim();
    if (!reason) {
      showError('Informe o motivo da rejeição.');
      return;
    }

    setIsRejecting(true);
    setProcessing(rejectTarget.item.id, true);
    try {
      if (rejectTarget.type === 'RESERVA') {
        await rejectReservation(rejectTarget.item.id, {
          motivo_rejeicao: reason,
        });
        setReservations((items) =>
          items.map((item) =>
            item.id === rejectTarget.item.id
              ? { ...item, status: 'REJEITADA', motivo_rejeicao: reason }
              : item,
          ),
        );
      } else {
        await rejectMaterialRequest(rejectTarget.item.id, {
          motivo_rejeicao: reason,
        });
        setMaterialRequests((items) =>
          items.map((item) =>
            item.id === rejectTarget.item.id
              ? { ...item, status: 'REJEITADA', motivo_rejeicao: reason }
              : item,
          ),
        );
      }
      Toast.show({ type: 'success', text1: 'Rejeição registrada.' });
      setRejectTarget(null);
      setRejectReason('');
    } catch (error) {
      console.error('Erro ao rejeitar solicitação:', error);
      showError('Não foi possível registrar a rejeição.');
    } finally {
      setIsRejecting(false);
      setProcessing(rejectTarget.item.id, false);
    }
  };

  return {
    activeTab,
    setActiveTab,
    isLoading,
    processingIds,
    pendingReservations,
    todayConfirmedReservations,
    approvedReservations,
    pendingMaterialRequests,
    withdrawnMaterialRequests,
    handleApproveReservation,
    handleRegisterAbsence,
    handleReallocatePress,
    handleApproveMaterial,
    handleConfirmReturn,
    rejectTarget,
    rejectReason,
    setRejectReason,
    openRejectModal,
    closeRejectModal,
    confirmReject,
    isRejecting,
  };
}
