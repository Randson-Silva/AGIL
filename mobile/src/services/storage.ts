import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY: string = 'auth_token';
const REFRESH_TOKEN_KEY: string = 'auth_refresh_token';
const USER_KEY: string = 'auth_user';

export const storage = {
  async saveAuthData(token: string, user: unknown, refreshToken?: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    if (refreshToken) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getAuthData() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return {
      token,
      refreshToken,
      user: userStr ? JSON.parse(userStr) : null,
    };
  },
  async clearAuthData() {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(USER_KEY),
    ]);
  },
};
