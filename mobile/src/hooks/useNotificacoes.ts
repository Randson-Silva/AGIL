import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from './useAuth';
import { getBreakdowns } from '../services/breakdown.service';
import { getInventoryAlerts } from '../services/inventory.service';
import { getReservations } from '../services/reservation.service';
import { listMaterialRequests } from '../services/material-request.service';
import { PanelAlertItem } from '../components/notifications/types';

export function useNotificacoes() {
  const router = useRouter();
  const { firstName, initials } = useAuth();

  const [panelAlerts, setPanelAlerts] = useState<PanelAlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [breakdownsRes, alertsRes, reservationsRes, requestsRes] = await Promise.allSettled([
        getBreakdowns(),
        getInventoryAlerts(),
        getReservations(),
        listMaterialRequests(),
      ]);

      const alerts: PanelAlertItem[] = [];

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
            description: `Reportado por ${b.usuario?.nome || 'Professor'}${
              b.insumo?.localizacao ? ` – ${b.insumo.localizacao}` : ''
            }`,
            badgeLabel: 'Avaria',
          });
        });
      }

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

      if (reservationsRes.status === 'fulfilled' && Array.isArray(reservationsRes.value.data)) {
        const pendingReservations = reservationsRes.value.data.filter(
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
      }

      if (requestsRes.status === 'fulfilled' && Array.isArray(requestsRes.value.data)) {
        const pendingRequests = requestsRes.value.data.filter(
          (req: any) => req.status === 'PENDENTE',
        );

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
      }

      setPanelAlerts(alerts);
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
    isLoading,
    isRefreshing,
    handleRefresh,
  };
}
