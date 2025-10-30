// src/services/SubscriptionService.ts
import axiosInstance from './axiosInstance';
import { API_BASE_URL } from '../config';

export const SubscriptionService = {
  getPrices: async () => {
    const res = await axiosInstance.get(`${API_BASE_URL}/subscriptions/prices`);
    return res.data;
  },

  updatePrices: async (
    monthlyPrice: number,
    yearlyPrice: number,
    freeMonths: number,
    token: string
  ) => {
    const res = await axiosInstance.put(
      `${API_BASE_URL}/subscriptions/prices`,
      { monthlyPrice, yearlyPrice, freeMonths },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  },
};
