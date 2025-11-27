
'use client'
import React, { useEffect, useState } from 'react';

const defaultTheme = {
  primary: '#0f172a',
  accent: '#0ea5a4',
  bg: '#ffffff',
  text: '#0f172a'
};

export default function ThemeBuilder(){
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(()=>{
    const root = document.documentElement;
    root.style.setProperty('--ne-primary', theme.primary);
    root.style.setProperty('--ne-accent', theme.accent);
    root.style.setProperty('--ne-bg', theme.bg);
    root.style.setProperty('--ne-text', theme.text);
    localStorage.setItem('ne-theme', JSON.stringify(theme));
  }, [theme]);

  useEffect(()=>{
    const saved = localStorage.getItem('ne-theme');
    if(saved) setTheme(JSON.parse(saved));
  }, []);

  return (
    <div className='p-4 border rounded bg-white shadow-sm'>
      <h3 className='font-semibold mb-2'>Theme Builder</h3>
      <div className='grid grid-cols-2 gap-2'>
        <label>Primary: <input type='color' value={theme.primary} onChange={e=>setTheme({...theme, primary:e.target.value})} /></label>
        <label>Accent: <input type='color' value={theme.accent} onChange={e=>setTheme({...theme, accent:e.target.value})} /></label>
        <label>Background: <input type='color' value={theme.bg} onChange={e=>setTheme({...theme, bg:e.target.value})} /></label>
        <label>Text: <input type='color' value={theme.text} onChange={e=>setTheme({...theme, text:e.target.value})} /></label>
      </div>
    </div>
  )
}
