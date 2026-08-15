import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export function useApiData<T>({ url }: { url: string }) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(url);
      setData(response.data as T);
    } catch {
      setError('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
}

export function useMutate(url: string, method: 'post' | 'put' | 'delete' = 'post') {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async <T = unknown>(body?: unknown, customUrl?: string): Promise<T> => {
    setIsLoading(true);
    try {
      const targetUrl = customUrl || url;
      const response =
        method === 'delete'
          ? await api.delete(targetUrl)
          : method === 'put'
          ? await api.put(targetUrl, body)
          : await api.post(targetUrl, body);
      return response.data as T;
    } finally {
      setIsLoading(false);
    }
  };

  return { execute, isLoading };
}
