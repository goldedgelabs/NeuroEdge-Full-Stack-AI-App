// src/components/chat/FileDropzone.tsx
'use client';
import React, { useCallback, useState } from 'react';
import axios from 'axios';

export default function FileDropzone({ onUploaded }: { onUploaded: (meta:any)=>void }) {
  const [files, setFiles] = useState<File[]>([]);
  const onDrop = useCallback((f: FileList | null) => {
    if (!f) return;
    const arr = Array.from(f);
    setFiles(arr);
    // auto-upload (optional)
    const form = new FormData();
    arr.forEach(file=>form.append('files', file));
    axios.post('/api/uploads', form, { headers: {'Content-Type':'multipart/form-data'} })
      .then(res => onUploaded(res.data))
      .catch(()=> alert('Upload failed'));
  }, [onUploaded]);

  return (
    <div className="p-3 border-dashed border-2 rounded text-center">
      <input id="file-upload" type="file" multiple onChange={(e)=>onDrop(e.target.files)} className="hidden" />
      <label htmlFor="file-upload" className="cursor-pointer inline-block px-4 py-2 bg-gray-100 rounded">Upload files</label>
      <div className="mt-2 text-sm text-gray-500">Or drag & drop here</div>

      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((f,i)=> <div key={i} className="text-sm">{f.name} • {Math.round(f.size/1024)} KB</div>)}
        </div>
      )}
    </div>
  );
}
