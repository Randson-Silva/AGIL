import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { getReservations } from '../services/reservation.service';
import { listMaterialRequests } from '../services/material-request.service';
import { HistoryNotificationItem } from '../components/notifications/types';

interface InternalNotificationItem extends HistoryNotificationItem {
  sortTime: number;
}

function formatTimestamp(dateString?: string | null): string {
  if (!dateString) return 'Hoje';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Hoje';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const diffDays = Math.round(
      (today.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (diffDays === 0) {
      return `Hoje, ${hours}:${minutes}`;
    }

    if (diffDays === 1) {
      return `Ontem, ${hours}:${minutes}`;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  } catch {
    return 'Hoje';
  }
}

function formatDateBr(dateString?: string | null): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString || '';
  }
}

function formatReservationDetails(res: any): string {
  const parts: string[] = [];
  if (res.local) parts.push(res.local);

  if (res.data_reserva) {
    try {
      const d = new Date(res.data_reserva);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        let slotStr = `${day}/${month}`;
        if (res.horarios && res.horarios.length > 0) {
          slotStr += ` às ${res.horarios[0].hora_inicio}`;
        }
        parts.push(slotStr);
      }
    } catch {}
  }

  return parts.length > 0 ? ` · ${parts.join(' · ')}` : '';
}

export function useProfessorNotificacoes() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [notifications, setNotifications] = useState<HistoryNotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [reservationsRes, requestsRes] = await Promise.allSettled([
        getReservations(),
        listMaterialRequests(),
      ]);

      const items: InternalNotificationItem[] = [];

      // 1. Processar Reservas de Sala/Laboratório do Professor
      if (
        reservationsRes.status === 'fulfilled' &&
        Array.isArray(reservationsRes.value.data)
      ) {
        reservationsRes.value.data.forEach((r: any) => {
          const code = `R-${r.id ? r.id.substring(0, 4).toUpperCase() : '1000'}`;
          const isAbsence = r.motivo_rejeicao?.includes('Ausência');
          const time = new Date(r.created_at || r.data_reserva).getTime() || Date.now();

          if (isAbsence) {
            items.push({
              id: `res-absence-${r.id}`,
              type: 'AUSENCIA',
              title: 'Ausência registrada',
              timestamp: formatTimestamp(r.created_at || r.data_reserva),
              subtitle: `Reserva ${code} marcada como ausente`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/reservas'),
            });
          } else if (r.status === 'APROVADA') {
            const detailStr = formatReservationDetails(r);
            items.push({
              id: `res-approved-${r.id}`,
              type: 'APROVADA',
              title: 'Reserva aprovada',
              timestamp: formatTimestamp(r.created_at || r.data_reserva),
              subtitle: `Reserva ${code}${detailStr}`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/reservas'),
            });
          } else if (r.status === 'REJEITADA') {
            const reason = r.motivo_rejeicao || 'conflito com reserva prioritária';
            items.push({
              id: `res-rejected-${r.id}`,
              type: 'REJEITADA',
              title: 'Reserva rejeitada',
              timestamp: formatTimestamp(r.created_at || r.data_reserva),
              subtitle: `Reserva ${code} · ${reason}`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/reservas'),
            });
          } else if (r.status === 'PENDENTE' || r.status === 'AVISO_SIMPLES') {
            const detailStr = formatReservationDetails(r);
            items.push({
              id: `res-pending-${r.id}`,
              type: 'RESERVA_PENDENTE',
              title: 'Reserva aguardando aprovação',
              timestamp: formatTimestamp(r.created_at || r.data_reserva),
              subtitle: `Reserva ${code}${detailStr} · aguardando análise do técnico`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/reservas'),
            });
          }
        });
      }

      // 2. Processar Solicitações de Materiais e Devoluções do Professor
      if (
        requestsRes.status === 'fulfilled' &&
        Array.isArray(requestsRes.value.data)
      ) {
        requestsRes.value.data.forEach((req: any) => {
          const code = `S-${req.id ? req.id.substring(0, 4).toUpperCase() : '300'}`;
          const time = new Date(req.criada_em || req.aprovada_em).getTime() || Date.now();

          if (req.status === 'PENDENTE') {
            items.push({
              id: `req-pending-${req.id}`,
              type: 'MATERIAL_PENDENTE',
              title: 'Solicitação de material pendente',
              timestamp: formatTimestamp(req.criada_em),
              subtitle: `${code} aguardando análise do técnico`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/materiais'),
            });
          } else if (req.status === 'APROVADA' && req.data_devolucao) {
            items.push({
              id: `req-return-${req.id}`,
              type: 'PRAZO_DEVOLUCAO',
              title: 'Prazo de devolução próximo',
              timestamp: formatTimestamp(req.aprovada_em || req.criada_em),
              subtitle: `Solicitação ${code} · devolver até ${formatDateBr(req.data_devolucao)}`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/materiais'),
            });
          } else if (req.status === 'REJEITADA') {
            items.push({
              id: `req-rejected-${req.id}`,
              type: 'REJEITADA',
              title: 'Solicitação rejeitada',
              timestamp: formatTimestamp(req.criada_em),
              subtitle: `Solicitação ${code} · ${req.motivo_rejeicao || 'Rejeitada pelo técnico'}`,
              sortTime: time,
              onPress: () => router.navigate('/(protected)/(professor)/materiais'),
            });
          }
        });
      }

      // Ordenar do mais recente para o mais antigo
      items.sort((a, b) => b.sortTime - a.sortTime);

      setNotifications(items);
    } catch (error) {
      console.error('Erro ao buscar notificações do professor:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchData();
    }, [fetchData]),
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchData();
  }, [fetchData]);

  return {
    firstName,
    initials,
    notifications,
    isLoading,
    isRefreshing,
    handleRefresh,
  };
}
