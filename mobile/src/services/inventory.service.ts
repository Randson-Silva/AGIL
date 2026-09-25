import axios from 'axios';

export const getInventoryItems = async () => {
  console.log(`/inventory/inputs`);
  return await axios.get(`/inventory/inputs`);
};

export const createInventoryItem = async (category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await axios.post(`/inventory/${endpoint}`, payload);
};

export const updateInventoryItem = async (id: string, category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await axios.patch(`/inventory/${endpoint}/${id}`, payload);
};

export const deleteInventoryItem = async (id: string) => {
  return await axios.delete(`/inventory/${id}`);
};

export const incrementInventoryStock = async (id: string, amount: number) => {
  return await axios.patch(`/inventory/stock/${id}/increment`, { amount });
};

export const decrementInventoryStock = async (id: string, amount: number) => {
  return await axios.patch(`/inventory/stock/${id}/decrement`, { amount });
};
