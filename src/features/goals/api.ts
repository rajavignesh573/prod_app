import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { Goal, GoalCreatePayload } from '@/types';

const key = 'goals';
type AddGoalProgressVariables = { goalId: string; payload: { workNote: string; percentage: number } };

export function useGoalsQuery(token: string) {
  return useQuery<Goal[]>({
    queryKey: [key],
    queryFn: () => requestJson<Goal[]>(token, '/api/goals'),
    enabled: Boolean(token)
  });
}

export function useCreateGoalMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Goal, Error, GoalCreatePayload>({
    mutationFn: (payload: GoalCreatePayload) =>
      requestJson<Goal>(token, '/api/goals', {
        method: 'POST',
        data: payload
      }),
    onSuccess: (created) => {
      queryClient.setQueryData<Goal[]>([key], (previous = []) => [created, ...previous]);
    }
  });
}

export function useAddGoalProgressMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Goal, Error, AddGoalProgressVariables>({
    mutationFn: ({ goalId, payload }: AddGoalProgressVariables) =>
      requestJson<Goal>(token, `/api/goals/${goalId}/progress`, {
        method: 'POST',
        data: payload
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Goal[]>([key], (list = []) =>
        list.map((goal) => (goal.id === updated.id ? updated : goal))
      );
    }
  });
}

export function useDeleteGoalMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Goal, Error, string>({
    mutationFn: (goalId: string) =>
      requestJson<Goal>(token, `/api/goals/${goalId}`, {
        method: 'DELETE'
      }),
    onSuccess: (deleted) => {
      queryClient.setQueryData<Goal[]>([key], (list = []) => list.filter((goal) => goal.id !== deleted.id));
    }
  });
}
