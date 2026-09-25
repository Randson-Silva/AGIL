import axios from 'axios';
import { storage } from './storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const { token } = await storage.getAuthData();

  // se encontrar token já insere (garantia rotas públicas e privadas)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
