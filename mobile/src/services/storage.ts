import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY: string = 'auth_token';
const USER_KEY: string = 'auth_user';

export const storage = {
  async saveAuthData(token: string, user: any) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },
  async getAuthData() {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
    };
  },
  async clearAuthData() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  },
};
