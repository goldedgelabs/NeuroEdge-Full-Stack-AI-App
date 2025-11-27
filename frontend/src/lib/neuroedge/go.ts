
import axios from 'axios';
export default class GoClient {
  base: string;
  constructor(base: string) { this.base = base.replace(/\/$/, '') }
  async runEngine(name: string, payload: any) {
    return axios.post(this.base + '/runEngine?name=' + encodeURIComponent(name), payload).then(r=>r.data)
  }
  async health(name?: string) { return axios.get(this.base + '/health/engine' + (name?('?name='+encodeURIComponent(name)):'')).then(r=>r.data) }
}
