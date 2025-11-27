
import http from 'k6/http';
import { sleep } from 'k6';
export let options = {
  vus: 20,
  duration: '30s',
};
export default function () {
  let url = 'http://host.docker.internal:9000/runEngine?name=StorageEngine';
  let payload = JSON.stringify({ action: 'upsert', id: 'id-' + Math.random(), vector: [0.1,0.2,0.3] });
  http.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  let qry = JSON.stringify({ action: 'query', vector: [0.1,0.2,0.3] });
  http.post(url, qry, { headers: { 'Content-Type': 'application/json' } });
  sleep(0.1);
}
