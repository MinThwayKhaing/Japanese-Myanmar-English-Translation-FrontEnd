
import { API_BASE_URL } from '../config';
import axiosInstance from './axiosInstance';
export const UserService = {
  /**
   * Change user password
   * @param currentPassword - user's current password
   * @param newPassword - new password to update
   * @param token - user auth token
   */
  changePassword: async (currentPassword: string, newPassword: string, token: string) => {
    const res = await axiosInstance.put(
      `${API_BASE_URL}/users/password`,
      { currentPassword, newPassword },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res?.data ?? null;
  },

  /**
   * Get all favorite words (no pagination)
   * @param token - user auth token
   */
  getFavorites: async (token: string) => {
    const res = await axiosInstance.get(`${API_BASE_URL}/users/favorites`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res?.data ?? [];
  },

  /**
   * Add word to favorites
   * @param wordId - ID of the word to add
   * @param token - user auth token
   */
  addFavorite: async (wordId: string, token: string) => {
    const res = await axiosInstance.post(
      `${API_BASE_URL}/users/favorites/add`,
      { wordId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res?.data ?? null;
  },
getProfile: async (token: string) => {
    const res = await axiosInstance.get(`${API_BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res?.data ?? null;
  },
  /**
   * Remove word from favorites
   * @param wordId - ID of the word to remove
   * @param token - user auth token
   */
  removeFavorite: async (wordId: string, token: string) => {
    const res = await axiosInstance.delete(`${API_BASE_URL}/users/favorites/remove`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { wordId }, // axios DELETE supports data payload
    });
    return res?.data ?? null;
  },

  /**
   * Get paginated favorites list
   * @param page - page number
   * @param limit - number of items per page
   * @param token - user auth token
   */
  getFavoritesPaginated: async (page: number, limit: number, token: string) => {
    const res = await axiosInstance.get(
      `${API_BASE_URL}/users/favorites/paginated?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res?.data ?? { favorites: [], hasMore: false };
  },

  /**
   * Get subscribed users (example feature)
   * @param token - user auth token
   */
  getSubscribedUsers: async (token: string) => {
    const res = await axiosInstance.get(`${API_BASE_URL}/users/subscribed`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res?.data ?? [];
  },
  /**
 * Delete own user account
 * @param token - user auth token
 */
deleteMe: async (token: string) => {
  const res = await axiosInstance.delete(
    `${API_BASE_URL}/users/me`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return res?.data ?? null;
},

  /**
   * Search users by email (admin)
   */
  searchUsers: async (query: string, token: string) => {
    const res = await axiosInstance.get(
      `${API_BASE_URL}/admin/users?q=${encodeURIComponent(query)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res?.data ?? [];
  },

  /**
   * Update a user's searchesLeft count (admin)
   */
  updateSearchesLeft: async (userId: string, searchesLeft: number, token: string) => {
    const res = await axiosInstance.put(
      `${API_BASE_URL}/admin/users/searches-left`,
      { userId, searchesLeft },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return res?.data ?? null;
  },

};
