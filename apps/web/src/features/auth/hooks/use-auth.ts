import { useMutation } from '@tanstack/react-query';
import apiClient, { setTokens } from '@/lib/api-client';
import { useAuthStore } from '../store/auth-store';

export function useLogin() {
  const storeSetTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      storeSetTokens(data.accessToken, data.refreshToken);
    },
  });
}

export function useRegister() {
  const storeSetTokens = useAuthStore((s) => s.setTokens);

  return useMutation({
    mutationFn: async (data: { email: string; name: string; password: string }) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    },
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      storeSetTokens(data.accessToken, data.refreshToken);
    },
  });
}
