import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { getBreakdowns } from '../services/breakdown.service';
import { getInventoryAlerts } from '../services/inventory.service';
import { getReservations } from '../services/reservation.service';
import { listMaterialRequests } from '../services/material-request.service';
import {
  PanelAlertItem,
  HistoryNotificationItem,
} from '../components/notifications/types';

function formatTimestamp(dateString?: string | null): string {
  if (!dateString) return 'Hoje';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Hoje';

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `Hoje, ${hours}:${minutes}`;
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

export function useNotificacoes() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [panelAlerts, setPanelAlerts] = useState<PanelAlertItem[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<
    HistoryNotificationItem[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [breakdownsRes, alertsRes, reservationsRes, requestsRes] =
        await Promise.allSettled([
          getBreakdowns(),
          getInventoryAlerts(),
          getReservations(),
          listMaterialRequests(),
        ]);

      const alerts: PanelAlertItem[] = [];
      const history: HistoryNotificationItem[] = [];

      // 1. Processar Avarias
      if (breakdownsRes.status === 'fulfilled' && Array.isArray(breakdownsRes.value.data)) {
        breakdownsRes.value.data.forEach((b: any) => {
          const matName = b.insumo?.nome || 'Insumo';
          const ocorr =
            b.tipo_ocorrencia === 'QUEBRA'
              ? 'quebrada'
              : b.tipo_ocorrencia === 'DEFEITO'
              ? 'com defeito'
              : b.tipo_ocorrencia?.toLowerCase() || 'avariado';

          alerts.push({
            id: `breakdown-${b.id}`,
            variant: 'avaria',
            title: `${matName} ${ocorr}`,
            description: `Reportado por ${b.usuario?.nome || 'Professor'} – Lab. de Química Geral`,
            badgeLabel: 'Avaria',
          });
        });
      }

      // 2. Processar Alertas de Estoque Baixo
      if (alertsRes.status === 'fulfilled' && Array.isArray(alertsRes.value.data)) {
        alertsRes.value.data.forEach((a: any) => {
          const matName = a.insumo?.nome || 'Material';
          const saldo = Number(a.quantidade_momento ?? a.insumo?.quantidade_saldo ?? 0);
          const min = Number(a.insumo?.quantidade_minima ?? 0);
          const loc = a.insumo?.localizacao ? ` · ${a.insumo.localizacao}` : '';

          alerts.push({
            id: `alert-${a.id}`,
            variant: 'estoque_baixo',
            title: `${matName} abaixo do mínimo`,
            description: `${saldo} em estoque · mínimo ${min}${loc}`,
            badgeLabel: 'Estoque baixo',
            onPress: () => router.navigate('/(protected)/(tecnico)/inventory'),
          });
        });
      }

      // 3. Processar Reservas
      if (reservationsRes.status === 'fulfilled' && Array.isArray(reservationsRes.value.data)) {
        const reservations = reservationsRes.value.data;
        const pendingReservations = reservations.filter(
          (r: any) => r.status === 'PENDENTE' || r.status === 'AVISO_SIMPLES',
        );

        if (pendingReservations.length > 0) {
          const praticas = pendingReservations.filter(
            (r: any) => r.objetivo === 'AULA_PRATICA',
          ).length;
          const outros = pendingReservations.length - praticas;

          let desc = `${pendingReservations.length} reservas aguardando`;
          if (praticas > 0 && outros > 0) {
            desc = `${praticas} aula${praticas > 1 ? 's' : ''} prática${praticas > 1 ? 's' : ''} e ${outros} TCC/Pesquisa`;
          } else if (praticas > 0) {
            desc = `${praticas} aula${praticas > 1 ? 's' : ''} prática${praticas > 1 ? 's' : ''}`;
          }

          alerts.push({
            id: 'reservas-pendentes',
            variant: 'reserva',
            title: 'Reservas aguardando aprovação',
            description: desc,
            badgeLabel: 'Reserva',
            onPress: () => router.navigate('/(protected)/(tecnico)/aprovacoes'),
          });
        }

        // Histórico de Reservas (Aprovadas, Rejeitadas, Ausências)
        reservations
          .filter(
            (r: any) =>
              r.status === 'APROVADA' ||
              r.status === 'REJEITADA' ||
              r.motivo_rejeicao?.includes('Ausência'),
          )
          .forEach((r: any) => {
            const isAbsence = r.motivo_rejeicao?.includes('Ausência');
            const code = `R-${r.id ? r.id.substring(0, 4).toUpperCase() : '1000'}`;

            if (isAbsence) {
              history.push({
                id: `hist-absence-${r.id}`,
                type: 'AUSENCIA',
                title: 'Ausência registrada',
                timestamp: formatTimestamp(r.created_at || r.data_reserva),
                subtitle: `Reserva ${code} marcada como ausente`,
              });
            } else if (r.status === 'APROVADA') {
              history.push({
                id: `hist-approved-${r.id}`,
                type: 'APROVADA',
                title: 'Reserva Aprovada',
                timestamp: formatTimestamp(r.created_at || r.data_reserva),
                subtitle: `Reserva ${code} confirmada no laboratório`,
              });
            } else if (r.status === 'REJEITADA') {
              history.push({
                id: `hist-rejected-${r.id}`,
                type: 'REJEITADA',
                title: 'Reserva rejeitada',
                timestamp: formatTimestamp(r.created_at || r.data_reserva),
                subtitle: `Reserva ${code} · ${r.motivo_rejeicao || 'Rejeitada pelo técnico'}`,
              });
            }
          });
      }

      // 4. Processar Solicitações de Materiais
      if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value.data)) {
        const requests = requestsRes.value.data;
        const pendingRequests = requests.filter((req: any) => req.status === 'PENDENTE');

        if (pendingRequests.length > 0) {
          alerts.push({
            id: 'materiais-pendentes',
            variant: 'material',
            title: 'Solicitações de materiais e insumos aguardando aprovação',
            description: `${pendingRequests.length} solicitaç${pendingRequests.length > 1 ? 'ões' : 'ão'}`,
            badgeLabel: 'Reserva',
            onPress: () => router.navigate('/(protected)/(tecnico)/aprovacoes'),
          });
        }

        // Histórico: Devoluções próximas ou concluídas
        requests.forEach((req: any) => {
          const code = `S-${req.id ? req.id.substring(0, 4).toUpperCase() : '300'}`;
          if (req.status === 'APROVADA' && req.data_devolucao) {
            history.push({
              id: `hist-return-${req.id}`,
              type: 'PRAZO_DEVOLUCAO',
              title: 'Prazo de devolução próximo',
              timestamp: formatTimestamp(req.aprovada_em || req.criada_em),
              subtitle: `Solicitação ${code} · devolver até ${formatDateBr(req.data_devolucao)}`,
              onPress: () => router.navigate('/(protected)/(tecnico)/aprovacoes'),
            });
          }
        });
      }

      // Ordenar histórico pelo mais recente
      history.sort((a, b) => b.id.localeCompare(a.id));

      setPanelAlerts(alerts);
      setHistoryNotifications(history);
      setHistoryNotifications(history);
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
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
    panelAlerts,
    historyNotifications,
    isLoading,
    isRefreshing,
    handleRefresh,
  };
}
