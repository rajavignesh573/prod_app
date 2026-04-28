import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { Task } from '@/types';

const key = 'tasks';
type TaskPayload = Omit<Task, 'id'>;
type TaskStatusVariables = { taskId: string; status: Task['status'] };
type VoiceUploadVariables = { fileName: string; fileType: string };
type VoiceUploadResponse = { uploadUrl: string; key: string };
type VoiceUploadInput = { file: File };
type VoiceUploadResult = { key: string };

export function useTasksQuery(token: string) {
  return useQuery<Task[]>({
    queryKey: [key],
    queryFn: () => requestJson<Task[]>(token, '/api/tasks'),
    enabled: Boolean(token)
  });
}

export function useCreateTaskMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, TaskPayload>({
    mutationFn: (payload: TaskPayload) =>
      requestJson<Task>(token, '/api/tasks', {
        method: 'POST',
        data: payload
      }),
    onSuccess: (created) => {
      queryClient.setQueryData<Task[]>([key], (previous = []) => [created, ...previous]);
    }
  });
}

export function useUpdateTaskStatusMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<Task, Error, TaskStatusVariables, { previous: Task[] | undefined }>({
    mutationFn: ({ taskId, status }: TaskStatusVariables) =>
      requestJson<Task>(token, `/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        data: { status }
      }),
    onMutate: async ({ taskId, status }: TaskStatusVariables) => {
      await queryClient.cancelQueries({ queryKey: [key] });
      const previous = queryClient.getQueryData<Task[]>([key]);
      queryClient.setQueryData<Task[]>([key], (list = []) =>
        list.map((task) => (task.id === taskId ? { ...task, status } : task))
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([key], context.previous);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<Task[]>([key], (list = []) =>
        list.map((task) => (task.id === updated.id ? updated : task))
      );
    }
  });
}

export function useDeleteTaskMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<unknown, Error, string, { previous: Task[] | undefined }>({
    mutationFn: (taskId: string) =>
      requestJson<unknown>(token, `/api/tasks/${taskId}`, {
        method: 'DELETE'
      }),
    onMutate: async (taskId: string) => {
      await queryClient.cancelQueries({ queryKey: [key] });
      const previous = queryClient.getQueryData<Task[]>([key]);
      queryClient.setQueryData<Task[]>([key], (list = []) =>
        list.filter((task) => task.id !== taskId)
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData([key], context.previous);
    }
  });
}

export function useVoiceUploadUrlMutation(token: string) {
  return useMutation<VoiceUploadResponse, Error, VoiceUploadVariables>({
    mutationFn: ({ fileName, fileType }: VoiceUploadVariables) =>
      requestJson<VoiceUploadResponse>(token, '/api/uploads/voice-note-url', {
        method: 'POST',
        data: { fileName, fileType }
      })
  });
}

export function useUploadVoiceNoteMutation(token: string) {
  return useMutation<VoiceUploadResult, Error, VoiceUploadInput>({
    mutationFn: async ({ file }: VoiceUploadInput) => {
      const signed = await requestJson<VoiceUploadResponse>(token, '/api/uploads/voice-note-url', {
        method: 'POST',
        data: {
          fileName: file.name,
          fileType: file.type || 'audio/webm'
        }
      });

      const uploadResponse = await fetch(signed.uploadUrl, { method: 'PUT', body: file });
      if (!uploadResponse.ok) throw new Error('S3 upload failed');
      return { key: signed.key };
    }
  });
}
