import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from './useAuth';
import { getUsageHistory, UsageHistoryItem } from '../services/inventory.service';
import { getReservationHistory, ReservationHistoryItem } from '../services/reservation.service';
import { generateReservationHistoryPdf, generateUsageHistoryPdf } from '../utils/history-pdf';

export type HistoryMode = 'USO' | 'RESERVAS';
export type UsageFilterType = 'TODOS' | 'ENTRADA' | 'BAIXA' | 'AVARIA';
export type ReservationFilterStatus = 'TODAS' | 'ACEITAS' | 'RECUSADAS';

function toIsoDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatBrDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function formatRelativeDateTime(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const now = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  const isSameDay = (a: Date, b: Date) =>
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameDay(date, now)) {
    return `Hoje, ${hours}:${minutes}`;
  }
  if (isSameDay(date, yesterday)) {
    return `Ontem, ${hours}:${minutes}`;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}, ${hours}:${minutes}`;
}

export function useTecnicoHistorico() {
  const { firstName, initials } = useAuth();

  const getDefaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  };

  const [mode, setMode] = useState<HistoryMode>('USO');
  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate);
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const [usageType, setUsageType] = useState<UsageFilterType>('TODOS');
  const [reservationStatus, setReservationStatus] = useState<ReservationFilterStatus>('TODAS');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [usageItems, setUsageItems] = useState<UsageHistoryItem[]>([]);
  const [reservationItems, setReservationItems] = useState<ReservationHistoryItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const fetchHistory = useCallback(async () => {
    try {
      const startIso = toIsoDateOnly(startDate);
      const endIso = toIsoDateOnly(endDate);
      const trimmedSearch = searchQuery.trim() || undefined;

      if (mode === 'USO') {
        const res = await getUsageHistory({
          startDate: startIso,
          endDate: endIso,
          type: usageType,
          search: trimmedSearch,
        });
        setUsageItems(Array.isArray(res.data) ? res.data : []);
      } else {
        const res = await getReservationHistory({
          startDate: startIso,
          endDate: endIso,
          status: reservationStatus,
          search: trimmedSearch,
        });
        setReservationItems(Array.isArray(res.data) ? res.data : []);
      }
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar histórico',
        text2: 'Verifique a conexão e tente novamente.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mode, startDate, endDate, usageType, reservationStatus, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchHistory();
    }, [fetchHistory]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchHistory();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchHistory]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  const handleChangeStartDate = (selected: Date) => {
    setStartDate(selected);
    if (selected > endDate) {
      setEndDate(selected);
    }
  };

  const handleChangeEndDate = (selected: Date) => {
    if (selected < startDate) {
      setStartDate(selected);
    }
    setEndDate(selected);
  };

  const handleClearFilters = () => {
    setStartDate(getDefaultStartDate());
    setEndDate(new Date());
    setUsageType('TODOS');
    setReservationStatus('TODAS');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  const handleExportPdf = async () => {
    const hasItems = mode === 'USO' ? usageItems.length > 0 : reservationItems.length > 0;

    if (!hasItems) {
      Toast.show({
        type: 'info',
        text1: 'Sem registros',
        text2: 'Não há registros filtrados para gerar o relatório em PDF.',
      });
      return;
    }

    try {
      setIsExportingPdf(true);
      const periodLabel = `${formatBrDate(startDate)} até ${formatBrDate(endDate)}`;

      if (mode === 'USO') {
        const labelMap: Record<UsageFilterType, string> = {
          TODOS: 'Todos',
          ENTRADA: 'Entrada',
          BAIXA: 'Baixa',
          AVARIA: 'Avaria',
        };
        await generateUsageHistoryPdf({
          items: usageItems,
          periodLabel,
          filterLabel: labelMap[usageType],
          searchQuery: searchQuery.trim() || undefined,
          generatedBy: firstName || 'Técnico',
        });
      } else {
        const labelMap: Record<ReservationFilterStatus, string> = {
          TODAS: 'Todas',
          ACEITAS: 'Aceitas',
          RECUSADAS: 'Recusadas',
        };
        await generateReservationHistoryPdf({
          items: reservationItems,
          periodLabel,
          filterLabel: labelMap[reservationStatus],
          searchQuery: searchQuery.trim() || undefined,
          generatedBy: firstName || 'Técnico',
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao gerar PDF',
        text2: 'Não foi possível exportar o relatório.',
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return {
    firstName,
    initials,
    mode,
    setMode,
    startDate,
    endDate,
    handleChangeStartDate,
    handleChangeEndDate,
    usageType,
    setUsageType,
    reservationStatus,
    setReservationStatus,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    usageItems,
    reservationItems,
    isLoading,
    isRefreshing,
    isExportingPdf,
    handleRefresh,
    handleClearFilters,
    handleExportPdf,
  };
}
