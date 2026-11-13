import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { useAuth } from './useAuth';
import { listMaterialRequests } from '../services/material-request.service';
import { getReservations } from '../services/reservation.service';
import { getInventoryItems } from '../services/inventory.service';
import { getBreakdowns } from '../services/breakdown.service';
import { AlertItem, QuickAccessItem, StatItem } from '../components/dashboard/types';

const OCCURRENCE_LABELS: Record<string, string> = {
  QUEBRA: 'Quebra',
  DEFEITO: 'Defeito',
  CONTAMINACAO: 'Contaminação',
  EXTRAVIO: 'Extravio',
  OUTRO: 'Avaria',
};

function formatTimeAgo(dateInput?: string | Date): string {
  if (!dateInput) return 'agora';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'recente';

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(1, Math.floor(diffMs / 60000));

  if (diffMin < 60) return `há ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `há ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  return `há ${diffDays} d`;
}

export function useDashboard() {
  const { firstName, initials } = useAuth();
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [criticalCount, setCriticalCount] = useState<number>(0);
  const [inventoryCount, setInventoryCount] = useState<number>(0);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const handleNavigateToInventory = () => {
    router.navigate('/(protected)/(tecnico)/inventory');
  };

  const handleNavigateToNewItem = () => {
    router.navigate('/(protected)/(tecnico)/new-item');
  };

  const handleNavigateToAprovacoes = () => {
    router.navigate('/(protected)/(tecnico)/aprovacoes');
  };

  const handleNavigateToNotificacoes = () => {
    router.navigate('/(protected)/(tecnico)/notificacoes');
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchStats = async () => {
        setIsLoadingStats(true);

        const [requestsResult, reservationsResult, inventoryResult, breakdownsResult] =
          await Promise.allSettled([
            listMaterialRequests({ status: 'PENDENTE' }),
            getReservations(),
            getInventoryItems(),
            getBreakdowns(),
          ]);

        if (!isActive) return;

        const dynamicAlerts: AlertItem[] = [];

        if (breakdownsResult.status === 'fulfilled') {
          const breakdownData = breakdownsResult.value.data;
          if (Array.isArray(breakdownData)) {
            breakdownData.slice(0, 5).forEach((b: any) => {
              const occurrenceLabel = OCCURRENCE_LABELS[b.tipo_ocorrencia] || b.tipo_ocorrencia;
              const unit = (b.insumo?.tipo_medida || 'UN').toLowerCase();
              const qty = Number(b.quantidade ?? 0);
              const profName = b.usuario?.nome || 'Professor';
              const extraDetail = b.descricao
                ? b.descricao
                : b.insumo?.localizacao || 'Laboratório';

              dynamicAlerts.push({
                id: `avaria-${b.id}`,
                status: 'Avaria',
                timeAgo: formatTimeAgo(b.data_reporte),
                title: `${b.insumo?.nome || 'Material'} — ${occurrenceLabel} (${qty} ${unit})`,
                description: `Reportado por ${profName} — ${extraDetail}`,
                onPress: handleNavigateToNotificacoes,
              });
            });
          }
        } else {
          console.error('Erro ao buscar avarias reportadas:', breakdownsResult.reason);
        }

        let pendingMaterials = 0;
        if (requestsResult.status === 'fulfilled') {
          const data = requestsResult.value.data;
          pendingMaterials = Array.isArray(data) ? data.length : 0;

          if (pendingMaterials > 0) {
            dynamicAlerts.push({
              id: 'materiais-pendentes',
              status: 'Material',
              timeAgo: formatTimeAgo(data[0]?.criada_em),
              title: `${pendingMaterials} ${
                pendingMaterials === 1
                  ? 'solicitação de material aguardando aprovação'
                  : 'solicitações de materiais e insumos aguardando aprovação'
              }`,
              description: `${pendingMaterials} pedido(s) de insumos pendente(s) de liberação`,
              onPress: handleNavigateToAprovacoes,
            });
          }
        } else {
          console.error('Erro ao buscar aprovações pendentes de materiais:', requestsResult.reason);
        }

        let pendingReservations = 0;
        if (reservationsResult.status === 'fulfilled') {
          const data = reservationsResult.value.data;
          if (Array.isArray(data)) {
            const pendingResList = data.filter(
              (r) => r.status === 'PENDENTE' || r.status === 'AVISO_SIMPLES',
            );
            pendingReservations = pendingResList.length;

            if (pendingResList.length > 0) {
              const practicalCount = pendingResList.filter(
                (r) => r.objetivo === 'AULA_PRATICA',
              ).length;
              const otherCount = pendingResList.length - practicalCount;

              dynamicAlerts.push({
                id: 'reservas-pendentes',
                status: 'Reserva',
                timeAgo: formatTimeAgo(pendingResList[0]?.created_at),
                title: `${pendingResList.length} ${
                  pendingResList.length === 1
                    ? 'reserva aguardando aprovação'
                    : 'reservas aguardando aprovação'
                }`,
                description: `${practicalCount} aula(s) prática(s) e ${otherCount} outra(s) atividade(s)`,
                onPress: handleNavigateToAprovacoes,
              });
            }
          }
        } else {
          console.error('Erro ao buscar reservas pendentes:', reservationsResult.reason);
        }

        setPendingCount(pendingMaterials + pendingReservations);

        if (inventoryResult.status === 'fulfilled') {
          const data = inventoryResult.value.data?.data || inventoryResult.value.data;
          if (Array.isArray(data)) {
            setInventoryCount(data.length);
            const criticalItems = data.filter(
              (item: { quantidade_saldo?: number; quantidade_minima?: number }) =>
                Number(item.quantidade_saldo ?? 0) <= Number(item.quantidade_minima ?? 0),
            );
            setCriticalCount(criticalItems.length);

            criticalItems.slice(0, 3).forEach((item: any) => {
              const unit = (item.tipo_medida || 'UN').toLowerCase();
              dynamicAlerts.push({
                id: `estoque-${item.id}`,
                status: 'Estoque baixo',
                timeAgo: formatTimeAgo(item.updated_at || item.created_at),
                title: `${item.nome} abaixo do mínimo`,
                description: `${Number(item.quantidade_saldo)} ${unit} em estoque · mínimo ${Number(item.quantidade_minima ?? 0)} ${unit}${
                  item.localizacao ? ` · ${item.localizacao}` : ''
                }`,
                onPress: handleNavigateToInventory,
              });
            });
          } else {
            setInventoryCount(0);
            setCriticalCount(0);
          }
        } else {
          console.error('Erro ao buscar inventário:', inventoryResult.reason);
          setInventoryCount(0);
          setCriticalCount(0);
        }

        setAlerts(dynamicAlerts);
        setIsLoadingStats(false);
      };

      fetchStats();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const stats: StatItem[] = [
    {
      id: '1',
      count: pendingCount.toString().padStart(2, '0'),
      label: 'Aprovações\npendentes',
      iconName: 'ClipboardDocumentCheckIcon',
      onPress: handleNavigateToAprovacoes,
    },
    {
      id: '2',
      count: criticalCount.toString().padStart(2, '0'),
      label: 'Itens\ncríticos',
      iconName: 'ExclamationTriangleIcon',
      onPress: handleNavigateToInventory,
    },
    {
      id: '3',
      count: inventoryCount.toString().padStart(2, '0'),
      label: 'Itens no\ninventário',
      iconName: 'CubeIcon',
      onPress: handleNavigateToInventory,
    },
  ];

  const quickAccessMock: QuickAccessItem[] = [
    {
      id: '1',
      label: 'Horários de\npico',
      iconName: 'ChartBarIcon',
      onPress: () => console.log('Horários de pico pressionado'),
    },
    {
      id: '2',
      label: 'Atas de\naula',
      iconName: 'DocumentTextIcon',
      onPress: () => console.log('Atas de aula pressionado'),
    },
    {
      id: '3',
      label: 'Inventário\nmestre',
      iconName: 'BeakerIcon',
      onPress: handleNavigateToInventory,
    },
    {
      id: '4',
      label: 'Cadastrar\nitem',
      iconName: 'PlusCircleIcon',
      onPress: handleNavigateToNewItem,
    },
  ];

  return {
    firstName,
    initials,
    stats,
    isLoadingStats,
    alertsMock: alerts,
    quickAccessMock,
    handleNavigateToNotificacoes,
  };
}
