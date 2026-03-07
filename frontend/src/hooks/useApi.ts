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

  // allow configuration of base URL so static builds can talk to backend
  // compute base url at runtime if variable is missing (helps container builds)
  // Vite exposes env vars via import.meta.env
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    `http://${window.location.hostname}:5000`;

  const request = useCallback(async (url: string, options?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiBase}${url}`, {
        withCredentials: true,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = (axiosError.response?.data as any)?.error || 'An error occurred';
      const apiError: ApiError = {
        message: String(errorMessage),
        status: axiosError.response?.status,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  const post = useCallback(async (url: string, payload: any, options?: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${apiBase}${url}`, payload, {
        withCredentials: true,
        ...options,
      });
      setData(response.data);
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError;
      const errorMessage = (axiosError.response?.data as any)?.error || 'An error occurred';
      const apiError: ApiError = {
        message: String(errorMessage),
        status: axiosError.response?.status,
      };
      setError(apiError);
      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, [apiBase]);

  return { data, error, isLoading, request, post };
}
