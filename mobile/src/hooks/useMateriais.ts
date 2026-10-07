import { useState, useCallback, useMemo } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getInventoryItems } from '../services/inventory.service';
import { listMaterialRequests, createMaterialRequest } from '../services/material-request.service';
import { useAuth } from './useAuth';

const PAGE_SIZE = 5; // itens por página

export function useMateriais() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [catalog, setCatalog] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States de Formulário
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});
  
  // Datas (YYYY-MM-DD local)
  const [withdrawalDate, setWithdrawalDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  
  // Paginação
  const [catalogPage, setCatalogPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle do modal de calendrio
  const [calendarType, setCalendarType] = useState<'withdrawal' | 'return' | null>(null);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setIsLoading(true);
          const [inventoryRes, historyRes] = await Promise.all([
            getInventoryItems(),
            listMaterialRequests()
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
    }, [])
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
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'Preencha as datas de retirada e devolução.' });
      return false;
    }
    
    // Obter apenas a data sem as horas locais (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];
    
    if (withdrawalDate < todayStr) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'A data de retirada não pode ser no passado.' });
      return false;
    }

    if (returnDate < withdrawalDate) {
      Toast.show({ type: 'error', text1: 'Atenção', text2: 'A devolução não pode ser anterior à retirada.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const itemsSelected = Object.keys(cart).map(id => ({ insumo_id: id, quantidade: cart[id] }));
    
    if (itemsSelected.length === 0) {
      Toast.show({ type: 'info', text1: 'Atenção', text2: 'Adicione pelo menos um item da lista.' });
      return;
    }

    if (!validateDates()) return;

    try {
      setIsSubmitting(true);
      await createMaterialRequest({
        finalidade: `Solicitação para ${withdrawalDate} até ${returnDate}`,
        descricao: `Retirada: ${withdrawalDate} | Devolução: ${returnDate}`,
        itens: itemsSelected
      });
      
      Toast.show({ type: 'success', text1: 'Sucesso', text2: 'Solicitação enviada com sucesso!' });
      
      // Limpar formulário
      setCart({});
      setWithdrawalDate('');
      setReturnDate('');
      setSearchQuery('');
      setCatalogPage(1);
      
      // Recarregar histórico
      const historyRes = await listMaterialRequests();
      setHistory(historyRes.data || []);
      setHistoryPage(1);

    } catch (error) {
      console.error('Erro ao solicitar materiais:', error);
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Não foi possível solicitar os materiais.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFirstName = () => {
    if (!user?.name) return 'Professor';
    return user.name.split(' ')[0];
  };

  const getInitials = () => {
    if (!user?.name) return 'PR';
    const names = user.name.trim().split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const handleDateSelect = (date: string) => {
    if (calendarType === 'withdrawal') {
      setWithdrawalDate(date);
    } else if (calendarType === 'return') {
      setReturnDate(date);
    }
    setCalendarType(null);
  };

  return {
    firstName: getFirstName(),
    initials: getInitials(),
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
    
    calendarType,
    setCalendarType,
    handleDateSelect,
    
    paginatedHistory,
    historyPage,
    setHistoryPage,
    totalHistoryPages,
    
    handleSubmit
  };
}
