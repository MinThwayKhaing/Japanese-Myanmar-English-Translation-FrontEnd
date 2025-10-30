import axiosInstance from './axiosInstance';
import { API_BASE_URL } from '../config';
export const WordService = {
    // Search words by query
    searchWords: async (query, token) => {
        try {
            const res = await axiosInstance.get(`${API_BASE_URL}/words/search`, {
                params: { q: query },
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });
            if (Array.isArray(res.data))
                return res.data;
            if (res.data?.words)
                return res.data.words;
            return [];
        }
        catch (err) {
            console.error('Error in searchWords:', err);
            return [];
        }
    },
    getWordByID: async (id, token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/words/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data;
    },
    // New: Select one word (shared user/admin)
    selectOneWord: async (id, token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/words/selectone/${id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data;
    },
    getAllWords: async (page = 1, limit = 15, query = '', token) => {
        const res = await axiosInstance.get(`${API_BASE_URL}/words`, {
            params: { page, limit, q: query },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        return res.data;
    },
    createWord: async (word, token) => {
        const res = await axiosInstance.post(`${API_BASE_URL}/words`, word, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    updateWord: async (id, word, token) => {
        const res = await axiosInstance.put(`${API_BASE_URL}/words/${id}`, word, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return res.data;
    },
    deleteWord: async (id, token) => {
        console.log('Deleting word with ID:', id);
        await axiosInstance.delete(`${API_BASE_URL}/words/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    },
    // New: Upload Excel file to create words
    uploadExcelWords: async (file, token) => {
        if (file.content) {
            // Method 1: Upload as base64
            const res = await axiosInstance.post(`${API_BASE_URL}/words/excel-upload-base64`, {
                fileName: file.name,
                fileData: file.content,
                fileType: file.type,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000,
            });
            return res.data;
        }
        else {
            // Method 2: Fallback to FormData (for backward compatibility)
            const formData = new FormData();
            formData.append('file', {
                uri: file.uri,
                name: file.name || 'words.xlsx',
                type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const res = await axiosInstance.post(`${API_BASE_URL}/words/excel-upload`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 60000,
            });
            return res.data;
        }
    },
};
//# sourceMappingURL=wordService.js.map