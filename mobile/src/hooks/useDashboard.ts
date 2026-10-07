import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { listMaterialRequests } from '../services/material-request.service';
import { getInventoryItems } from '../services/inventory.service';
import {
  AlertItem,
  QuickAccessItem,
  StatItem,
} from '../components/dashboard/types';

export function useDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [inventoryCount, setInventoryCount] = useState<number>(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Função para pegar o primeiro nome
  const getFirstName = () => {
    if (!user?.name) return 'Usuário';
    return user.name.split(' ')[0];
  };

  // Função para pegar iniciais
  const getInitials = () => {
    if (!user?.name) return 'US';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleNavigateToInventory = () => {
    router.navigate('/(protected)/(tecnico)/inventory');
  };

  const handleNavigateToNewItem = () => {
    router.navigate('/(protected)/(tecnico)/new-item');
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);

      const [requestsResult, inventoryResult] = await Promise.allSettled([
        listMaterialRequests({ status: 'PENDENTE' }),
        getInventoryItems(),
      ]);

      if (requestsResult.status === 'fulfilled') {
        const data = requestsResult.value.data?.data || requestsResult.value.data;
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } else {
        console.error('Erro ao buscar aprovações pendentes:', requestsResult.reason);
        setPendingCount(0);
      }

      if (inventoryResult.status === 'fulfilled') {
        const data = inventoryResult.value.data?.data || inventoryResult.value.data;
        setInventoryCount(Array.isArray(data) ? data.length : 0);
      } else {
        console.error('Erro ao buscar inventário:', inventoryResult.reason);
        setInventoryCount(0);
      }

      setIsLoadingStats(false);
    };

    fetchStats();
  }, []);

  const stats: StatItem[] = [
    {
      id: '1',
      count: pendingCount.toString().padStart(2, '0'),
      label: 'Aprovações\npendentes',
      iconName: 'ClipboardDocumentCheckIcon',
    },
    {
      id: '2',
      count: '03',
      label: 'Itens\ncríticos',
      iconName: 'ExclamationTriangleIcon',
    },
    {
      id: '3',
      count: inventoryCount.toString().padStart(2, '0'),
      label: 'Itens no\ninventário',
      iconName: 'CubeIcon',
    },
  ];

  const alertsMock: AlertItem[] = [
    {
      id: '1',
      status: 'Avaria',
      timeAgo: 'há 12 min',
      title: 'Bureta 50 mL quebrada',
      description: 'Reportado por Prof.ª Jaqueline Rocha — Lab. de Química Geral',
    },
    {
      id: '2',
      status: 'Estoque baixo',
      timeAgo: 'há 1 h',
      title: 'Permanganato de Potássio abaixo do mínimo',
      description: '1 frasco em estoque · mínimo 2 · Armário A3',
    },
    {
      id: '3',
      status: 'Reserva',
      timeAgo: 'há 2 h',
      title: '3 reservas aguardando aprovação',
      description: '2 aulas práticas e 1 pesquisa/TCC',
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
    firstName: getFirstName(),
    initials: getInitials(),
    stats,
    isLoadingStats,
    alertsMock,
    quickAccessMock,
  };
}
