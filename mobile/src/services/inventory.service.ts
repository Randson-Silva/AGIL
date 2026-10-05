import { api } from './api';

export const getInventoryItems = async () => {
  const inputs = await api.get(`/inventory/inputs`);

  return inputs;
};

export const createInventoryItem = async (category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await api.post(`/inventory/${endpoint}`, payload);
};

export const updateInventoryItem = async (id: string, category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await api.patch(`/inventory/${endpoint}/${id}`, payload);
};

export const deleteInventoryItem = async (id: string) => {
  return await api.delete(`/inventory/${id}`);
};

export const incrementInventoryStock = async (id: string, amount: number) => {
  return await api.patch(`/inventory/stock/${id}/increment`, { amount });
};

export const decrementInventoryStock = async (id: string, amount: number) => {
  return await api.patch(`/inventory/stock/${id}/decrement`, { amount });
};
