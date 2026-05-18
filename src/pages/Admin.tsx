import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    supabase.from('_test_connection').select('*').limit(1)
      .then(({ error }) => {
        if (!error || error.code === '42P01' || error.code === 'PGRST205') {
          setStatus('ok');
        } else {
          setStatus('error');
          setErrMsg(JSON.stringify(error));
        }
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-svh p-8 gap-4">
      <h1 className="text-2xl font-medium">Admin</h1>
      <p className="text-xs text-(--text)">key: {import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 12) ?? 'undefined'}</p>
      <p className="text-(--text)">
        Supabase:{' '}
        {status === 'pending' && 'connecting...'}
        {status === 'ok' && '✓ connected'}
        {status === 'error' && `✗ ${errMsg}`}
      </p>
    </main>
  );
}
