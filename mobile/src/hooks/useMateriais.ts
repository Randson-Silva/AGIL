import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getInventoryItems } from '../services/inventory.service';
import { listMaterialRequests, createMaterialRequest } from '../services/material-request.service';
import { useAuth } from './useAuth';

const PAGE_SIZE = 5; // itens por página

/** Aplica máscara DD-MM-YYYY enquanto o usuário digita */
function applyDMYMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4, 8)}`;
}

/** Converte DD-MM-YYYY para o padrão ISO YYYY-MM-DD (retorna null se inválida) */
function parseDMYToISO(dmy: string): string | null {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dmy)) return null;
  const [dd, mm, yyyy] = dmy.split('-').map(Number);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31 || yyyy < 1900) return null;

  const dateObj = new Date(yyyy, mm - 1, dd);
  if (
    dateObj.getFullYear() !== yyyy ||
    dateObj.getMonth() !== mm - 1 ||
    dateObj.getDate() !== dd
  ) {
    return null;
  }

  return `${String(yyyy)}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}

/** Converte YYYY-MM-DD (ISO) para DD-MM-YYYY (visualização) */
function formatISOToDMY(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [yyyy, mm, dd] = iso.split('-');
  return `${dd}-${mm}-${yyyy}`;
}

export function useMateriais() {
  const { firstName, initials } = useAuth();

  const [catalog, setCatalog] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States de Formulário
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  // Datas exibidas com máscara DD-MM-YYYY no Input
  const [withdrawalDate, setWithdrawalDateState] = useState('');
  const [returnDate, setReturnDateState] = useState('');

  const setWithdrawalDate = useCallback((text: string) => {
    setWithdrawalDateState(applyDMYMask(text));
  }, []);

  const setReturnDate = useCallback((text: string) => {
    setReturnDateState(applyDMYMask(text));
  }, []);

  // Datas convertidas para o padrão ISO (YYYY-MM-DD) para armazenamento/API/Calendário
  const withdrawalDateIso = useMemo(() => parseDMYToISO(withdrawalDate), [withdrawalDate]);
  const returnDateIso = useMemo(() => parseDMYToISO(returnDate), [returnDate]);

  // Paginação
  const [catalogPage, setCatalogPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle do modal de calendário
  const [calendarType, setCalendarType] = useState<'withdrawal' | 'return' | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [inventoryRes, historyRes] = await Promise.all([
            getInventoryItems(),
            listMaterialRequests(),
          ]);

          if (isActive) {
            setCatalog(inventoryRes.data || []);
            setHistory(historyRes.data || []);
          }
        } catch (error) {
          console.error('Erro ao buscar dados de materiais:', error);
          if (isActive) {
            Toast.show({
              type: 'error',
              text1: 'Erro',
              text2: 'Não foi possível buscar as informações.',
            });
          }
        } finally {
          if (isActive) {
            setIsLoading(false);
          }
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  // Filtro de Catálogo
  const filteredCatalog = useMemo(() => {
    if (!searchQuery) return catalog;
    const lowerQuery = searchQuery.toLowerCase();
    return catalog.filter((item) => item.nome.toLowerCase().includes(lowerQuery));
  }, [catalog, searchQuery]);

  // Paginação Catálogo
  const paginatedCatalog = useMemo(() => {
    const startIndex = (catalogPage - 1) * PAGE_SIZE;
    return filteredCatalog.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCatalog, catalogPage]);

  const totalCatalogPages = Math.ceil(filteredCatalog.length / PAGE_SIZE) || 1;

  // Paginação Histórico
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * PAGE_SIZE;
    return history.slice(startIndex, startIndex + PAGE_SIZE);
  }, [history, historyPage]);

  const totalHistoryPages = Math.ceil(history.length / PAGE_SIZE) || 1;

  const handleIncrement = (itemId: string) => {
    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleDecrement = (itemId: string) => {
    setCart((prev) => {
      const current = prev[itemId] || 0;
      if (current <= 1) {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      }
      return { ...prev, [itemId]: current - 1 };
    });
  };

  const validateDates = () => {
    if (!withdrawalDate || !returnDate) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'Preencha as datas de retirada e devolução.',
      });
      return false;
    }

    if (!withdrawalDateIso || !returnDateIso) {
      Toast.show({
        type: 'error',
        text1: 'Data inválida',
        text2: 'Informe as datas no formato DD-MM-AAAA.',
      });
      return false;
    }

    // Obter apenas a data sem as horas locais (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];

    if (withdrawalDateIso < todayStr) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'A data de retirada não pode ser no passado.',
      });
      return false;
    }

    if (returnDateIso < withdrawalDateIso) {
      Toast.show({
        type: 'error',
        text1: 'Atenção',
        text2: 'A devolução não pode ser anterior à retirada.',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const itemsSelected = Object.keys(cart).map((id) => ({ insumo_id: id, quantidade: cart[id] }));

    if (itemsSelected.length === 0) {
      Toast.show({
        type: 'info',
        text1: 'Atenção',
        text2: 'Adicione pelo menos um item da lista.',
      });
      return;
    }

    if (!validateDates() || !withdrawalDateIso || !returnDateIso) return;

    try {
      setIsSubmitting(true);
      await createMaterialRequest({
        finalidade: `Solicitação para ${withdrawalDateIso} até ${returnDateIso}`,
        descricao: `Retirada: ${withdrawalDateIso} | Devolução: ${returnDateIso}`,
        itens: itemsSelected,
      });

      Toast.show({
        type: 'success',
        text1: 'Sucesso',
        text2: 'Solicitação enviada com sucesso!',
      });

      // Limpar formulário
      setCart({});
      setWithdrawalDateState('');
      setReturnDateState('');
      setSearchQuery('');
      setCatalogPage(1);

      // Recarregar histórico
      const historyRes = await listMaterialRequests();
      setHistory(historyRes.data || []);
      setHistoryPage(1);
    } catch (error) {
      console.error('Erro ao solicitar materiais:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível solicitar os materiais.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateSelect = (dateIso: string) => {
    const formattedDMY = formatISOToDMY(dateIso);
    if (calendarType === 'withdrawal') {
      setWithdrawalDateState(formattedDMY);
    } else if (calendarType === 'return') {
      setReturnDateState(formattedDMY);
    }
    setCalendarType(null);
  };

  const selectedCalendarIsoDate =
    calendarType === 'withdrawal'
      ? withdrawalDateIso || ''
      : returnDateIso || '';

  return {
    firstName,
    initials,
    isLoading,
    isSubmitting,

    searchQuery,
    setSearchQuery,

    cart,
    handleIncrement,
    handleDecrement,

    paginatedCatalog,
    catalogPage,
    setCatalogPage,
    totalCatalogPages,

    withdrawalDate,
    setWithdrawalDate,
    returnDate,
    setReturnDate,
    selectedCalendarIsoDate,

    calendarType,
    setCalendarType,
    handleDateSelect,

    paginatedHistory,
    historyPage,
    setHistoryPage,
    totalHistoryPages,

    handleSubmit,
  };
}
