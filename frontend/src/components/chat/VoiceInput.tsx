// src/components/chat/VoiceInput.tsx
'use client';
import React, { useState, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import axios from 'axios';

const recorder = new MicRecorder({ bitRate: 128 });

export default function VoiceInput({ onTranscript }: { onTranscript: (text:string)=>void }) {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  async function start() {
    try {
      await recorder.start();
      setRecording(true);
    } catch (e) { console.error(e); alert('Microphone denied'); }
  }

  async function stopAndSend() {
    setLoading(true);
    try {
      const [buffer, blob] = await recorder.stop().getMp3();
      setRecording(false);
      // Upload to backend for transcription
      const form = new FormData();
      form.append('file', new Blob([buffer], { type: 'audio/mpeg' }), 'voice.mp3');
      // backend endpoint: POST /api/audio/transcribe -> { text }
      const res = await axios.post('/api/audio/transcribe', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res?.data?.text) onTranscript(res.data.text);
    } catch (e) {
      console.error(e);
      alert('Recording failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="flex items-center gap-2">
      {!recording ? (
        <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={start}>Start 🎤</button>
      ) : (
        <button className="px-3 py-2 bg-red-600 text-white rounded" onClick={stopAndSend} disabled={loading}>
          {loading ? 'Uploading...' : 'Stop & Send'}
        </button>
      )}
    </div>
  );
}
