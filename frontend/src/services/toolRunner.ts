export async function runTool(toolId: string, payload?: any) {
  // For example, call TS backend: /api/tools/:toolId
  const res = await fetch(`/api/tools/${toolId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  return res.json();
}
