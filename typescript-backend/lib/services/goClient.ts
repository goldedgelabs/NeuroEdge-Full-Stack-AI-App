import axios, { AxiosInstance } from 'axios';
import { createClient } from '../utils/httpClient';

const client: AxiosInstance = createClient(process.env.GO_BACKEND_URL || 'http://localhost:9000');

export async function health(): Promise<any> {
  const r = await client.get('/health');
  return r.data;
}
