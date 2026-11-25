'use client';

import { useState } from 'react';
import type { Group, Participant } from '@/lib/types';

export default function ShareLinks({
  group,
  participants,
}: {
  group: Group;
  participants: Participant[];
}) {
  const [copied, setCopied] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  function whatsappLink(name: string, url: string) {
    const message = `Olá, ${name}! O sorteio do grupo "${group.name}" está pronto. Abra seu resultado aqui: ${url}`;
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }

  return (
    <div className="mt-6 space-y-3">
      {participants.map((p) => {
        const url = `${origin}/eu/${p.id}`;
        return (
          <div
            key={p.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-body">
                {p.name}
              </p>
              <p className="truncate text-xs text-muted">{url}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => copy(url, p.id)}
                className="rounded-pill bg-primary-soft px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary-soft/70"
              >
                {copied === p.id ? 'Copiado!' : 'Copiar link'}
              </button>
              <a
                href={whatsappLink(p.name, url)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
              >
                WhatsApp
              </a>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          copy(
            participants
              .map((p) => `${p.name}: ${origin}/eu/${p.id}`)
              .join('\n'),
            '__all',
          )
        }
        className="mt-2 text-sm font-semibold text-primary underline-offset-2 transition hover:underline"
      >
        {copied === '__all' ? 'Todos os links copiados!' : 'Copiar todos os links'}
      </button>
    </div>
  );
}
