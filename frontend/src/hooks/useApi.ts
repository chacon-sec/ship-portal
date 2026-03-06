import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';

interface ApiError {
  message: string;
  status?: number;
}

export function useApi<T>() {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(async (url: string, options?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(url, {
        withCredentials: true,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data?.error || 'An error occurred';
      const apiError: ApiError = {
        message: String(errorMessage),
        status: axiosError.response?.status,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const post = useCallback(async (url: string, payload: any, options?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(url, payload, {
        withCredentials: true,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = axiosError.response?.data?.error || 'An error occurred';
      const apiError: ApiError = {
        message: String(errorMessage),
        status: axiosError.response?.status,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, error, isLoading, request, post };
}
