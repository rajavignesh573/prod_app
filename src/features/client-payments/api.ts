import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { requestJson } from '@/lib/api/http';
import type { ClientPayment, ClientPaymentUpsertPayload } from '@/types';

const key = 'client-payments';
type UpsertVariables = { clientName: string; payload: ClientPaymentUpsertPayload };
type MarkPaidVariables = { clientName: string; payload: { paidDate?: string; amountPaid: number; notes?: string } };

export function useClientPaymentsQuery(token: string) {
  return useQuery<ClientPayment[]>({
    queryKey: [key],
    queryFn: () => requestJson<ClientPayment[]>(token, '/api/client-payments'),
    enabled: Boolean(token)
  });
}

export function useUpsertClientPaymentMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<ClientPayment, Error, UpsertVariables>({
    mutationFn: ({ clientName, payload }: UpsertVariables) =>
      requestJson<ClientPayment>(token, `/api/client-payments/${encodeURIComponent(clientName)}`, {
        method: 'PUT',
        data: payload
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClientPayment[]>([key], (list = []) => {
        const exists = list.some((item) => item.clientName === updated.clientName);
        if (!exists) return [...list, updated].sort((a, b) => a.clientName.localeCompare(b.clientName));
        return list.map((item) => (item.clientName === updated.clientName ? updated : item));
      });
    }
  });
}

export function useMarkClientPaymentPaidMutation(token: string) {
  const queryClient = useQueryClient();
  return useMutation<ClientPayment, Error, MarkPaidVariables>({
    mutationFn: ({ clientName, payload }: MarkPaidVariables) =>
      requestJson<ClientPayment>(token, `/api/client-payments/${encodeURIComponent(clientName)}/mark-paid`, {
        method: 'POST',
        data: payload
      }),
    onSuccess: (updated) => {
      queryClient.setQueryData<ClientPayment[]>([key], (list = []) =>
        list.map((item) => (item.clientName === updated.clientName ? updated : item))
      );
    }
  });
}
