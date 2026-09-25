import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const getInventoryItems = async () => {
  console.log(`${API_URL}/inventory/inputs`);
  return await axios.get(`${API_URL}/inventory/inputs`);
};

export const createInventoryItem = async (category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await axios.post(`${API_URL}/inventory/${endpoint}`, payload);
};

export const updateInventoryItem = async (id: string, category: string, payload: any) => {
  let endpoint = '';
  if (category === 'REAGENTE') endpoint = 'reagent';
  else if (category === 'SOLUCAO') endpoint = 'solution';
  else if (category === 'EQUIPAMENTO') endpoint = 'equipment';
  else if (category === 'VIDRARIA') endpoint = 'glassware';

  return await axios.patch(`${API_URL}/inventory/${endpoint}/${id}`, payload);
};

export const deleteInventoryItem = async (id: string) => {
  return await axios.delete(`${API_URL}/inventory/${id}`);
};
