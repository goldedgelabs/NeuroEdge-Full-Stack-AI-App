import axios from 'axios';
import { log, error } from './logger';

const INTERNAL_KEY = process.env.NEXT_INTERNAL_API_KEY || '';

export const createClient = (baseURL: string) => {
  const client = axios.create({ baseURL, timeout: 10000 });
  client.interceptors.request.use(cfg => {
    if (INTERNAL_KEY) {
      cfg.headers = cfg.headers || {};
      cfg.headers['Authorization'] = `Bearer ${INTERNAL_KEY}`;
    }
    return cfg;
  }, err => { error(err); return Promise.reject(err); });
  client.interceptors.response.use(r => r, err => { error(err); return Promise.reject(err); });
  return client;
}
