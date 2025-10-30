import { API_BASE_URL } from '../config';
import axiosInstance from './axiosInstance';
export const UserService = {
    /**
     * Change user password
     * @param currentPassword - user's current password
     * @param newPassword - new password to update
     * @param token - user auth token
     */
    changePassword: async (currentPassword, newPassword, token) => {
        const res = await axiosInstance.put(`${API_BASE_URL}/users/password`, { currentPassword, newPassword }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    /**
     * Get all favorite words (no pagination)
     * @param token - user auth token
     */
    getFavorites: async (token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/users/favorites`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    /**
     * Add word to favorites
     * @param wordId - ID of the word to add
     * @param token - user auth token
     */
    addFavorite: async (wordId, token) => {
        const res = await axiosInstance.post(`${API_BASE_URL}/users/favorites/add`, { wordId }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    getProfile: async (token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    /**
     * Remove word from favorites
     * @param wordId - ID of the word to remove
     * @param token - user auth token
     */
    removeFavorite: async (wordId, token) => {
        const res = await axiosInstance.delete(`${API_BASE_URL}/users/favorites/remove`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { wordId }, // axios DELETE supports data payload
        });
        return res.data;
    },
    /**
     * Get paginated favorites list
     * @param page - page number
     * @param limit - number of items per page
     * @param token - user auth token
     */
    getFavoritesPaginated: async (page, limit, token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/users/favorites/paginated?page=${page}&limit=${limit}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    /**
     * Get subscribed users (example feature)
     * @param token - user auth token
     */
    getSubscribedUsers: async (token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/users/subscribed`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
};
//# sourceMappingURL=UserService.js.map