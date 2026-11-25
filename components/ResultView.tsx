'use client';

import { useEffect, useState } from 'react';
import Card from './Card';

type ResultData = {
  participantName: string;
  groupName: string;
  budgetHint: string | null;
  receiverName: string;
  wishlist: string | null;
};

export default function ResultView({ participantId: token }: { participantId: string }) {
  const [state, setState] = useState<'loading' | 'notFound' | 'ready'>('loading');
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      if (!/^[a-f0-9]{64}$/i.test(token)) { setState('notFound'); return; }
      try {
        const response = await fetch(`/api/result/${encodeURIComponent(token)}`, {
          cache: 'no-store', signal: controller.signal,
        });
        if (!response.ok) { setState('notFound'); return; }
        const data = await response.json() as ResultData;
        setResult(data); setState('ready');
      } catch {
        if (!controller.signal.aborted) setState('notFound');
      }
    }
    load();
    return () => controller.abort();
  }, [token]);

  if (state === 'loading') return <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><Card><p className="text-center text-sm text-muted">Carregando seu resultado...</p></Card></section>;
  if (state === 'notFound' || !result) return <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6"><Card><div className="rounded-card bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">Não encontramos seu sorteio. Confira se o link está completo e tente novamente.</div></Card></section>;

  return <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6"><Card>
    <p className="text-sm font-semibold uppercase tracking-wide text-accent">{result.groupName}</p>
    <h1 className="mt-2 font-display text-2xl font-bold text-primary">Olá, {result.participantName}!</h1>
    <p className="mt-1 text-sm text-muted">Guarde segredo — este link mostra apenas o seu resultado.</p>
    <div className="mt-8 rounded-card border border-accent-soft bg-accent-tint p-6 text-center">
      <p className="text-sm font-semibold text-accent-deep">Você tirou</p>
      <p className="mt-2 font-display text-3xl font-bold text-accent-dark">{result.receiverName}</p>
      {result.budgetHint && <p className="mt-2 text-sm font-semibold text-body">Valor sugerido: {result.budgetHint}</p>}
    </div>
    {result.wishlist && <div className="mt-6 rounded-card border border-line bg-background p-5"><p className="text-sm font-semibold text-body">Dica de {result.receiverName.split(' ')[0]}:</p><p className="mt-1 text-sm text-muted">{result.wishlist}</p></div>}
  </Card></section>;
}
