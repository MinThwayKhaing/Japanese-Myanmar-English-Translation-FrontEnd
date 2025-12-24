import axiosInstance from './axiosInstance';
import { API_BASE_URL } from '../config';

export interface Word {
  imageUrl : any;
  _id?: string;
  english: string;
  japanese?: string;
  myanmar?: string;
  subTerm?: string;
  createdAt?: string;
  updatedAt?: string;
  totalCount?: number;
}
export type RNFile = {
  uri: string;
  name: string;
  type: string;
};
export interface PaginatedWords {
  totalCount: number;
  words: Word[];
  hasMore: boolean;
  currentPage: number;
}

export const WordService = {
  // Search words by query
  searchWords: async (query: string, token?: string): Promise<Word[]> => {
    try {
      const res = await axiosInstance.get(`${API_BASE_URL}/words/search`, {
        params: { q: query },
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (Array.isArray(res.data)) return res.data;
      if (res.data?.words) return res.data.words;
      return [];
    } catch (err) {
      console.error('Error in searchWords:', err);
      return [];
    }
  },

  getWordByID: async (id: string, token?: string): Promise<Word> => {
    const res = await axiosInstance.get(`${API_BASE_URL}/words/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    console.log('getWordByID response data:', res.data);
    return res.data;
  },

  // New: Select one word (shared user/admin)
  selectOneWord: async (id: string, token?: string): Promise<Word> => {
    const res = await axiosInstance.get(`${API_BASE_URL}/words/selectone/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data;
  },

  getAllWords: async (page = 1, limit = 15, query = '', token?: string): Promise<PaginatedWords> => {
    const res = await axiosInstance.get(`${API_BASE_URL}/words`, {
      params: { page, limit, q: query },
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return res.data;
  },

createWord: async (formData: FormData, token: string): Promise<any> => {
  const res = await axiosInstance.post(`${API_BASE_URL}/words`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
},

updateWord: async (id: string, formData: FormData, token: string): Promise<any> => {
  const res = await axiosInstance.put(`${API_BASE_URL}/words/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
},


  deleteWord: async (id: string, token: string): Promise<void> => {
    console.log('Deleting word with ID:', id);
    await axiosInstance.delete(`${API_BASE_URL}/words/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

    // New: Upload Excel file to create words
  uploadExcelWords: async (file: {
      uri: string;
      name: string;
      type: string;
      content?: string; // base64 content
    }, token: string): Promise<{ message: string }> => {
      
      if (file.content) {
        // Method 1: Upload as base64
        const res = await axiosInstance.post(
          `${API_BASE_URL}/words/excel-upload-base64`,
          {
            fileName: file.name,
            fileData: file.content,
            fileType: file.type,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 60000,
          }
        );
        return res.data;
      } else {
        // Method 2: Fallback to FormData (for backward compatibility)
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'words.xlsx',
          type: file.type || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        } as any);

        const res = await axiosInstance.post(
          `${API_BASE_URL}/words/excel-upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000,
          }
        );
        return res.data;
      }
    },
};
