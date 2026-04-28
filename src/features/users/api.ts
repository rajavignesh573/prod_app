import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { User } from '@/types';

const key = 'users';
type SetUserAccessVariables = { userId: string; isActive: boolean };
type CreateUserPayload = { name: string; email: string; role: string; password: string };

export function useUsersQuery(token: string, enabled: boolean) {
  return useQuery<User[]>({
    queryKey: [key],
    queryFn: () => requestJson<User[]>(token, '/api/users'),
    enabled: Boolean(token) && enabled
  });
}

export function useCreateUserMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, CreateUserPayload>({
    mutationFn: (payload: CreateUserPayload) =>
      requestJson<User>(token, '/api/users', {
        method: 'POST',
        data: payload
      }),
    onSuccess: (created) => {
      queryClient.setQueryData<User[]>([key], (previous = []) => [...previous, created]);
    }
  });
}

export function useSetUserAccessMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, SetUserAccessVariables>({
    mutationFn: ({ userId, isActive }: SetUserAccessVariables) =>
      requestJson<User>(token, `/api/users/${userId}/access`, {
        method: 'PATCH',
        data: { isActive }
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<User[]>([key], (list = []) =>
        list.map((user) => (user.id === updated.id ? updated : user))
      );
    }
  });
}

export function useDeleteUserMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<User, Error, string>({
    mutationFn: (userId: string) =>
      requestJson<User>(token, `/api/users/${userId}`, {
        method: 'DELETE'
      }),
    onSuccess: (deleted) => {
      queryClient.setQueryData<User[]>([key], (list = []) => list.filter((user) => user.id !== deleted.id));
    }
  });
}
