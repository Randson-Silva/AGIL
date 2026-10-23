import { useState, useCallback, useMemo } from 'react';
import { getInventoryItems } from '../services/inventory.service';
import { useAuth } from './useAuth';

export type InventoryFilter =
  | 'Todos'
  | 'Estoque crítico'
  | 'Reagente'
  | 'Solução'
  | 'Vidraria'
  | 'Equipamento';

export const INVENTORY_FILTERS: InventoryFilter[] = [
  'Todos',
  'Estoque crítico',
  'Reagente',
  'Solução',
  'Vidraria',
  'Equipamento',
];

export interface InventoryItem {
  id: string;
  nome: string;
  categoria: 'REAGENTE' | 'SOLUCAO' | 'VIDRARIA' | 'EQUIPAMENTO' | string;
  tipo_medida: string;
  quantidade_saldo: number;
  quantidade_minima?: number | null;
  localizacao?: string | null;
  data_validade?: string | null;
  reagenteInfo?: {
    marca?: string | null;
    formula?: string | null;
    cas?: string | null;
    observacao?: string | null;
  } | null;
  solucaoInfo?: {
    formula?: string | null;
    cas?: string | null;
    observacao?: string | null;
  } | null;
  vidrariaInfo?: {
    marca?: string | null;
    capacidade?: string | null;
  } | null;
  equipamentoInfo?: {
    marca?: string | null;
    modelo?: string | null;
    voltagem?: string | null;
  } | null;
}

export function useInventory() {
  const { firstName, initials } = useAuth();

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<InventoryFilter>('Todos');

  const fetchInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getInventoryItems();
      setItems(response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleToggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const handleClearSearch = useCallback(() => {
    if (searchQuery.trim().length > 0) {
      setSearchQuery('');
    } else {
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  const criticalItemsCount = useMemo(() => {
    return items.filter(
      (item) => Number(item.quantidade_saldo) <= Number(item.quantidade_minima || 0),
    ).length;
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Filtro de texto (busca)
      const query = searchQuery.trim().toLowerCase();
      if (query) {
        const matchesSearch =
          item.nome?.toLowerCase().includes(query) ||
          item.localizacao?.toLowerCase().includes(query) ||
          Boolean(item.reagenteInfo?.cas && item.reagenteInfo.cas.toLowerCase().includes(query)) ||
          Boolean(item.solucaoInfo?.cas && item.solucaoInfo.cas.toLowerCase().includes(query));

        if (!matchesSearch) return false;
      }

      // Filtro de botões (categoria/estado)
      if (activeFilter === 'Estoque crítico') {
        return Number(item.quantidade_saldo) <= Number(item.quantidade_minima || 0);
      }
      if (activeFilter === 'Reagente') {
        return item.categoria === 'REAGENTE';
      }
      if (activeFilter === 'Solução') {
        return item.categoria === 'SOLUCAO';
      }
      if (activeFilter === 'Vidraria') {
        return item.categoria === 'VIDRARIA';
      }
      if (activeFilter === 'Equipamento') {
        return item.categoria === 'EQUIPAMENTO';
      }

      return true; // Todos
    });
  }, [items, searchQuery, activeFilter]);

  return {
    items: filteredItems,
    isLoading,
    filters: INVENTORY_FILTERS,
    isSearchOpen,
    handleToggleSearch,
    handleClearSearch,
    searchQuery,
    setSearchQuery,
    activeFilter,
    setActiveFilter,
    criticalItemsCount,
    fetchInventory,
    firstName,
    initials,
  };
}
