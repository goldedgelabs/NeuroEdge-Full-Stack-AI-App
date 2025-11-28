export async function sendMessage(conversationId: string, text: string) {
  const res = await fetch("/api/chat/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conversationId, text }),
  });

  return res.json();
}

export async function uploadFile(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/uploads", {
    method: "POST",
    body: fd,
  });

  return res.json();
}

export async function transcribeAudio(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/audio/transcribe", {
    method: "POST",
    body: fd,
  });

  return res.json();
  }
