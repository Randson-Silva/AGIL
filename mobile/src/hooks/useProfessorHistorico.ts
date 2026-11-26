import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { useAuth } from './useAuth';
import { formatBrDate, formatRelativeDateTime } from './useTecnicoHistorico';
import { getMyMaterialHistory, MyMaterialHistoryItem } from '../services/material-request.service';
import { getMyBreakdownHistory, MyBreakdownHistoryItem } from '../services/breakdown.service';
import { generateMyBreakdownHistoryPdf, generateMyMaterialHistoryPdf } from '../utils/history-pdf';

export type ProfessorHistoryMode = 'MATERIAIS' | 'AVARIAS';
export type MaterialHistoryFilterStatus = 'TODOS' | 'APROVADA' | 'DEVOLVIDA' | 'REJEITADA';

function toIsoDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export { formatBrDate, formatRelativeDateTime };

export function useProfessorHistorico(initialMode: ProfessorHistoryMode = 'MATERIAIS') {
  const { firstName, initials, user } = useAuth();

  const getDefaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  };

  const [mode, setMode] = useState<ProfessorHistoryMode>(initialMode);
  const [startDate, setStartDate] = useState<Date>(getDefaultStartDate);
  const [endDate, setEndDate] = useState<Date>(() => new Date());

  const [materialStatus, setMaterialStatus] = useState<MaterialHistoryFilterStatus>('TODOS');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [materialItems, setMaterialItems] = useState<MyMaterialHistoryItem[]>([]);
  const [hasAnyMaterialHistory, setHasAnyMaterialHistory] = useState(true);

  const [breakdownItems, setBreakdownItems] = useState<MyBreakdownHistoryItem[]>([]);
  const [hasAnyBreakdownHistory, setHasAnyBreakdownHistory] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHistory = useCallback(async () => {
    try {
      const startIso = toIsoDateOnly(startDate);
      const endIso = toIsoDateOnly(endDate);
      const search = debouncedSearch || undefined;

      if (mode === 'MATERIAIS') {
        const res = await getMyMaterialHistory({
          startDate: startIso,
          endDate: endIso,
          status: materialStatus,
          search,
        });
        setMaterialItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setHasAnyMaterialHistory(Boolean(res.data?.hasAnyHistory));
      } else {
        const res = await getMyBreakdownHistory({
          startDate: startIso,
          endDate: endIso,
          search,
        });
        setBreakdownItems(Array.isArray(res.data?.items) ? res.data.items : []);
        setHasAnyBreakdownHistory(Boolean(res.data?.hasAnyHistory));
      }
    } catch (error) {
      console.error('Erro ao buscar histórico pessoal:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro ao carregar histórico',
        text2: 'Verifique a conexão e tente novamente.',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [mode, startDate, endDate, materialStatus, debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      fetchHistory();
    }, [fetchHistory]),
  );

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
    setMaterialStatus('TODOS');
    setSearchQuery('');
    setDebouncedSearch('');
    setIsSearchOpen(false);
  };

  const handleExportPdf = async () => {
    const hasItems = mode === 'MATERIAIS' ? materialItems.length > 0 : breakdownItems.length > 0;

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
      const responsibleName =
        user?.name || firstName || (user?.profile === 'ALUNO' ? 'Aluno' : 'Professor');

      if (mode === 'MATERIAIS') {
        const labelMap: Record<MaterialHistoryFilterStatus, string> = {
          TODOS: 'Todos',
          APROVADA: 'Aprovados',
          DEVOLVIDA: 'Devolvidos',
          REJEITADA: 'Rejeitados',
        };
        await generateMyMaterialHistoryPdf({
          items: materialItems,
          periodLabel,
          filterLabel: labelMap[materialStatus],
          searchQuery: debouncedSearch || undefined,
          generatedBy: responsibleName,
        });
      } else {
        await generateMyBreakdownHistoryPdf({
          items: breakdownItems,
          periodLabel,
          searchQuery: debouncedSearch || undefined,
          generatedBy: responsibleName,
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
    materialStatus,
    setMaterialStatus,
    isSearchOpen,
    setIsSearchOpen,
    searchQuery,
    setSearchQuery,
    materialItems,
    hasAnyMaterialHistory,
    breakdownItems,
    hasAnyBreakdownHistory,
    isLoading,
    isRefreshing,
    isExportingPdf,
    handleRefresh,
    handleClearFilters,
    handleExportPdf,
  };
}
