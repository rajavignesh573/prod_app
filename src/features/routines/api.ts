import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { Routine, RoutineCreatePayload } from '@/types';

const key = 'routines';
type ToggleRoutineVariables = { routineId: string; isDone: boolean };

export function useRoutinesQuery(token: string) {
  return useQuery<Routine[]>({
    queryKey: [key],
    queryFn: () => requestJson<Routine[]>(token, '/api/routines'),
    enabled: Boolean(token)
  });
}

export function useCreateRoutineMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, RoutineCreatePayload>({
    mutationFn: (payload: RoutineCreatePayload) =>
      requestJson<Routine>(token, '/api/routines', {
        method: 'POST',
        data: payload
      }),
    onSuccess: (created) => {
      queryClient.setQueryData<Routine[]>([key], (previous = []) => [created, ...previous]);
    }
  });
}

export function useToggleRoutineMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, ToggleRoutineVariables>({
    mutationFn: ({ routineId, isDone }: ToggleRoutineVariables) =>
      requestJson<Routine>(token, `/api/routines/${routineId}/toggle`, {
        method: 'POST',
        data: { isDone }
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<Routine[]>([key], (list = []) =>
        list.map((routine) => (routine.id === updated.id ? updated : routine))
      );
    }
  });
}

export function useDeleteRoutineMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Routine, Error, string>({
    mutationFn: (routineId: string) =>
      requestJson<Routine>(token, `/api/routines/${routineId}`, {
        method: 'DELETE'
      }),
    onSuccess: (deleted) => {
      queryClient.setQueryData<Routine[]>([key], (list = []) => list.filter((routine) => routine.id !== deleted.id));
    }
  });
}
