import { getAccessToken } from "../auth/tokens";
import axios, { AxiosInstance } from 'axios';
import { getToken, getRefreshToken, saveToken } from '../auth/tokens';

function sleep(ms:number){ return new Promise(res=>setTimeout(res,ms)); }

export default class BaseClient {
  client: AxiosInstance;
  base: string;
  maxRetries: number = 3;
  constructor(base:string){
    this.base = base.replace(/\/$/, '');
    this.client = axios.create({ baseURL: this.base, timeout: 10000 });
    // request interceptor: inject token and tracing headers if available
    this.client.interceptors.request.use((cfg)=>{
      const token = typeof window !== 'undefined' ? getToken() : null;
      if(token) cfg.headers = {...cfg.headers, Authorization: 'Bearer ' + token};
      // tracing headers can be added here (W3C traceparent) if available from global tracer
      return cfg;
    });
    // response interceptor: handle 401 refresh
    this.client.interceptors.response.use((r)=>r, async (err)=>{
      const cfg = err.config;
      if(cfg && err.response && err.response.status === 401 && !cfg.__isRetry) {
        cfg.__isRetry = true;
        // attempt refresh
        const refresh = getRefreshToken ? getRefreshToken() : null;
        if(refresh){
          try{
            const res = await axios.post((process.env.NEXT_PUBLIC_TS_BACKEND_URL || process.env.TS_BACKEND_URL) + '/api/auth/refresh', { refresh });
            saveToken(res.data.access);
            cfg.headers['Authorization'] = 'Bearer ' + res.data.access;
            return this.client(cfg);
          }catch(e){ /* fallthrough */ }
        }
      }
      return Promise.reject(err);
    });
  }

  async requestWithRetry(cfg:any, attempt=0):Promise<any>{
    try{
      const res = await this.client.request(cfg);
      return res.data;
    }catch(e){
      if(attempt < this.maxRetries){
        await sleep(100 * Math.pow(2, attempt));
        return this.requestWithRetry(cfg, attempt+1);
      }
      throw e;
    }
  }
}
