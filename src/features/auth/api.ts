import { useMutation } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { LoginResponse } from '@/types';

interface LoginCredentials {
  email: string;
  password: string;
}

export function useLoginMutation() {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: (credentials: LoginCredentials) =>
      requestJson<LoginResponse>('', '/api/auth/login', {
        method: 'POST',
        data: credentials
      })
  });
}
