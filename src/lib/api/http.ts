import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import { z } from 'zod';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const envelopeSchema = z.object({
  data: z.unknown(),
  error: z.string().optional()
});

const client = axios.create({
  baseURL: API_BASE
});

export async function requestJson<T>(
  token: string,
  path: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const response = await client.request({
    url: path,
    ...config,
    headers: {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });

  const parsed = envelopeSchema.parse(response.data);
  return parsed.data as T;
}
