
export function saveToken(t: string) { localStorage.setItem('neuroedge_token', t) }
export function getToken(): string | null { return localStorage.getItem('neuroedge_token') }
export function clearToken() { localStorage.removeItem('neuroedge_token') }
