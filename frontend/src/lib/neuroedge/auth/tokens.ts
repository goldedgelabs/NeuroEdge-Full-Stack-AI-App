export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("neuroedge_token");
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("neuroedge_token", token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("neuroedge_token");
}
