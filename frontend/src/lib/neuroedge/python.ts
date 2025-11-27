
import axios from 'axios';
export default class PyClient {
  base: string;
  constructor(base: string) { this.base = base.replace(/\/$/, '') }
  async metrics() { return axios.get(this.base + '/api/metrics').then(r=>r.data) }
  async recommendations() { return axios.get(this.base + '/api/recommendations').then(r=>r.data) }
}
