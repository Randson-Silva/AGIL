import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { useAuth } from './useAuth';
import {
  getReservations,
  approveReservation,
  rejectReservation,
  registerReservationAbsence,
  ReservationItem,
} from '../services/reservation.service';
import {
  listMaterialRequests,
  approveMaterialRequest,
  rejectMaterialRequest,
  confirmMaterialReturn,
  MaterialRequestResponse,
} from '../services/material-request.service';
import { ApprovalTabOption } from '../components/approvals/approval-tabs';

export interface RejectTarget {
  id: string;
  type: 'RESERVA' | 'MATERIAL';
  protocol: string;
}

export function useAprovacoes() {
  const { firstName, initials } = useAuth();

  const [activeTab, setActiveTab] = useState<ApprovalTabOption>('RESERVAS');
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequestResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal de rejeição
  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [resReservas, resMateriais] = await Promise.all([
        getReservations(),
        listMaterialRequests(),
      ]);
      setReservations(resReservas.data || []);
      setMaterialRequests(resMateriais.data || []);
    } catch (error) {
      console.error('Erro ao carregar aprovações:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar',
        text2: 'Não foi possível buscar as solicitações pendentes.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  // Listas filtradas de Reservas
  const pendingReservations = useMemo(() => {
    return reservations.filter(
      (r) => r.status === 'PENDENTE' || r.status === 'AVISO_SIMPLES',
    );
  }, [reservations]);

  const todayIso = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const currentTime = useMemo(() => {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${min}`;
  }, []);

  const todayConfirmedReservations = useMemo(() => {
    return reservations.filter((r) => {
      if (r.status !== 'APROVADA') return false;
      const datePart = r.data_reserva?.split('T')[0];
      const isToday = datePart === todayIso;
      if (!isToday) return false;

      // Horário já iniciado
      if (!r.horarios || r.horarios.length === 0) return true;
      const sorted = [...r.horarios].sort((a, b) =>
        a.hora_inicio.localeCompare(b.hora_inicio),
      );
      return sorted[0].hora_inicio <= currentTime;
    });
  }, [reservations, todayIso, currentTime]);

  const approvedReservations = useMemo(() => {
    return reservations.filter((r) => r.status === 'APROVADA');
  }, [reservations]);

  // Listas filtradas de Materiais
  const pendingMaterialRequests = useMemo(() => {
    return materialRequests.filter((m) => m.status === 'PENDENTE');
  }, [materialRequests]);

  const withdrawnMaterialRequests = useMemo(() => {
    return materialRequests.filter((m) => m.status === 'APROVADA');
  }, [materialRequests]);

  // Ações de Reservas
  const handleApproveReservation = async (id: string) => {
    try {
      setProcessingId(id);
      await approveReservation(id);
      Toast.show({
        type: 'success',
        text1: 'Reserva aprovada',
        text2: 'A reserva de laboratório foi confirmada com sucesso.',
      });
      await fetchData();
    } catch (error) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: 'Erro ao aprovar',
        text2: typeof msg === 'string' ? msg : 'Não foi possível aprovar a reserva.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleRegisterAbsence = async (id: string) => {
    try {
      setProcessingId(id);
      await registerReservationAbsence(id);
      Toast.show({
        type: 'success',
        text1: 'Ausência registrada',
        text2: 'A ausência do solicitante foi registrada no sistema.',
      });
      await fetchData();
    } catch (error) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: 'Erro ao registrar ausência',
        text2: typeof msg === 'string' ? msg : 'Não foi possível registrar a ausência.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReallocatePress = () => {
    Toast.show({
      type: 'info',
      text1: 'Em construção',
      text2: 'A funcionalidade de realocação de reservas estará disponível em breve.',
    });
  };

  // Ações de Materiais
  const handleApproveMaterial = async (id: string) => {
    try {
      setProcessingId(id);
      await approveMaterialRequest(id);
      Toast.show({
        type: 'success',
        text1: 'Material aprovado',
        text2: 'Solicitação aprovada e baixa realizada no estoque.',
      });
      await fetchData();
    } catch (error) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: 'Erro ao aprovar',
        text2: typeof msg === 'string' ? msg : 'Não foi possível aprovar os materiais.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmReturn = async (id: string) => {
    try {
      setProcessingId(id);
      await confirmMaterialReturn(id);
      Toast.show({
        type: 'success',
        text1: 'Devolução confirmada',
        text2: 'Insumos devolvidos com sucesso e saldo de estoque atualizado.',
      });
      await fetchData();
    } catch (error) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: 'Erro ao devolver',
        text2: typeof msg === 'string' ? msg : 'Não foi possível confirmar a devolução.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  // Modal de Rejeição
  const openRejectModal = (id: string, type: 'RESERVA' | 'MATERIAL', protocol: string) => {
    setRejectTarget({ id, type, protocol });
    setRejectReason('');
  };

  const closeRejectModal = () => {
    setRejectTarget(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;

    if (!rejectReason.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Motivo obrigatório',
        text2: 'Informe uma justificativa para a rejeição.',
      });
      return;
    }

    try {
      setIsRejecting(true);
      if (rejectTarget.type === 'RESERVA') {
        await rejectReservation(rejectTarget.id, {
          motivo_rejeicao: rejectReason.trim(),
        });
        Toast.show({
          type: 'success',
          text1: 'Reserva rejeitada',
          text2: 'A reserva foi rejeitada e a justificativa foi gravada.',
        });
      } else {
        await rejectMaterialRequest(rejectTarget.id, {
          motivo_rejeicao: rejectReason.trim(),
        });
        Toast.show({
          type: 'success',
          text1: 'Solicitação rejeitada',
          text2: 'A solicitação foi rejeitada e o solicitante notificado.',
        });
      }
      closeRejectModal();
      await fetchData();
    } catch (error) {
      const msg = axios.isAxiosError(error) && error.response?.data?.message;
      Toast.show({
        type: 'error',
        text1: 'Erro ao rejeitar',
        text2: typeof msg === 'string' ? msg : 'Não foi possível rejeitar a solicitação.',
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return {
    firstName,
    initials,
    activeTab,
    setActiveTab,
    isLoading,
    processingId,
    // Reservas
    pendingReservations,
    todayConfirmedReservations,
    approvedReservations,
    handleApproveReservation,
    handleRegisterAbsence,
    handleReallocatePress,
    // Materiais
    pendingMaterialRequests,
    withdrawnMaterialRequests,
    handleApproveMaterial,
    handleConfirmReturn,
    // Rejeição
    rejectTarget,
    rejectReason,
    setRejectReason,
    isRejecting,
    openRejectModal,
    closeRejectModal,
    handleConfirmReject,
    // Refresh
    refresh: fetchData,
  };
}
