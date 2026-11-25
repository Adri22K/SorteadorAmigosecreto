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

  function resultUrl(p: Participant) {
    return `${origin}/eu/${p.id}`;
  }

  function whatsappUrl(p: Participant) {
    if (p.phone) {
      const phone = p.phone.startsWith('55') ? p.phone : `55${p.phone}`;
      return `https://wa.me/${phone}?text=${encodeURIComponent(whatsappMessage(p))}`;
    }
    return `https://wa.me/?text=${encodeURIComponent(whatsappMessage(p))}`;
  }

  function whatsappMessage(p: Participant) {
    return `Olá, ${p.name}! O sorteio do grupo "${group.name}" está pronto. Abra seu resultado aqui: ${resultUrl(p)}`;
  }

  function mailtoUrl(p: Participant) {
    return `mailto:${p.email}?subject=${encodeURIComponent(
      `Seu amigo secreto — ${group.name}`,
    )}&body=${encodeURIComponent(
      `Olá, ${p.name}!\n\nO sorteio do grupo "${group.name}" está pronto.\nAbra seu resultado aqui: ${resultUrl(p)}\n\nGuarde este link só para você.`,
    )}`;
  }

  return (
    <div className="mt-6 space-y-3">
      {participants.map((p) => {
        const url = resultUrl(p);
        return (
          <div
            key={p.id}
            className="flex flex-col gap-3 rounded-card border border-line bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-body">
                {p.name}
              </p>
              <p className="truncate text-xs text-muted">
                {(p.phone || p.email) ? (
                  <>
                    {p.phone && <span>{p.phone}</span>}
                    {p.phone && p.email && <span> · </span>}
                    {p.email && <span>{p.email}</span>}
                  </>
                ) : (
                  url
                )}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => copy(url, p.id)}
                className="rounded-pill bg-primary-soft px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary-soft/70"
              >
                {copied === p.id ? 'Copiado!' : 'Copiar link'}
              </button>
              <a
                href={whatsappUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-pill bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:bg-primary-hover"
              >
                {p.phone ? 'Zap' : 'Zap (copiar msg)'}
              </a>
              {p.email && (
                <a
                  href={mailtoUrl(p)}
                  className="rounded-pill bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
                >
                  E-mail
                </a>
              )}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() =>
          copy(
            participants
              .map((p) => `${p.name}: ${resultUrl(p)}`)
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
