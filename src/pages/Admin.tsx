import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [status, setStatus] = useState<'pending' | 'ok' | 'error'>('pending');

  useEffect(() => {
    supabase.from('_test_connection').select('*').limit(1)
      .then(({ error }) => {
        // "relation does not exist" = 연결은 됐지만 테이블이 없는 것 → OK
        setStatus(error?.code === '42P01' ? 'ok' : error ? 'error' : 'ok');
      });
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-svh p-8 gap-4">
      <h1 className="text-2xl font-medium">Admin</h1>
      <p className="text-(--text)">
        Supabase:{' '}
        {status === 'pending' && 'connecting...'}
        {status === 'ok' && '✓ connected'}
        {status === 'error' && '✗ failed'}
      </p>
    </main>
  );
}
