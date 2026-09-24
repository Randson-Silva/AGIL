import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.5:3000';

export const getInventoryItems = async () => {
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
