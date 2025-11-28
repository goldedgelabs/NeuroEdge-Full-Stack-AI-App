// src/components/chat/MarkdownMessage.tsx
'use client';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

export default function MarkdownMessage({ text }: { text: string }) {
  // sanitize at server or rely on rehype-raw cautiously
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown rehypePlugins={[rehypeRaw, rehypeHighlight]}>
        {text}
      </ReactMarkdown>
    </div>
  );
}
