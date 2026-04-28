import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { AddonItem, Addons } from '@/types';

const key = 'addons';
type AddonMutationVariables = { type: keyof Addons; value: string };
type UpdateAddonMutationVariables = { type: keyof Addons; oldValue: string; newValue: string };
type AddonApiType = 'clients' | 'task_categories' | 'routine_categories' | 'goal_categories';

const typeMap: Record<string, AddonApiType> = {
  clients: 'clients',
  taskCategories: 'task_categories',
  routineCategories: 'routine_categories',
  goalCategories: 'goal_categories'
};

function toApiType(type: keyof Addons): AddonApiType {
  const mapped = typeMap[type];
  if (!mapped) throw new Error(`Unsupported addon type: ${String(type)}`);
  return mapped;
}

export function useAddonsQuery(token: string) {
  return useQuery<Addons>({
    queryKey: [key],
    queryFn: () => requestJson<Addons>(token, '/api/addons'),
    enabled: Boolean(token)
  });
}

export function useAddAddonValueMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<AddonItem[], Error, AddonMutationVariables>({
    mutationFn: ({ type, value }: AddonMutationVariables) =>
      requestJson<AddonItem[]>(token, '/api/addons', {
        method: 'POST',
        data: { type: toApiType(type), value }
      }),
    onSuccess: (updatedList, variables) => {
      queryClient.setQueryData<Addons>([key], (current) => ({
        ...(current || {
          clients: [],
          taskCategories: [],
          routineCategories: [],
          goalCategories: [],
          categories: []
        }),
        [variables.type]: updatedList
      }));
    }
  });
}

export function useRemoveAddonValueMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<AddonItem[], Error, AddonMutationVariables>({
    mutationFn: ({ type, value }: AddonMutationVariables) =>
      requestJson<AddonItem[]>(token, '/api/addons', {
        method: 'DELETE',
        data: { type: toApiType(type), value }
      }),
    onSuccess: (updatedList, variables) => {
      queryClient.setQueryData<Addons>([key], (current) => ({
        ...(current || {
          clients: [],
          taskCategories: [],
          routineCategories: [],
          goalCategories: [],
          categories: []
        }),
        [variables.type]: updatedList
      }));
    }
  });
}

export function useUpdateAddonValueMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<AddonItem[], Error, UpdateAddonMutationVariables>({
    mutationFn: ({ type, oldValue, newValue }: UpdateAddonMutationVariables) =>
      requestJson<AddonItem[]>(token, '/api/addons', {
        method: 'PATCH',
        data: { type: toApiType(type), oldValue, newValue }
      }),
    onSuccess: (updatedList, variables) => {
      queryClient.setQueryData<Addons>([key], (current) => ({
        ...(current || {
          clients: [],
          taskCategories: [],
          routineCategories: [],
          goalCategories: [],
          categories: []
        }),
        [variables.type]: updatedList
      }));
    }
  });
}
