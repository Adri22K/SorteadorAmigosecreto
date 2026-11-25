'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Assignment, Group, Participant } from '@/lib/types';
import Card from './Card';

export default function ResultView({ participantId }: { participantId: string }) {
  const [state, setState] = useState<
    'loading' | 'notFound' | 'ready'
  >('loading');
  const [me, setMe] = useState<Participant | null>(null);
  const [receiver, setReceiver] = useState<Participant | null>(null);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const uuidPattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidPattern.test(participantId)) {
        if (!cancelled) setState('notFound');
        return;
      }

      const { data: meData } = await supabase
        .from('participants')
        .select('*, groups(*)')
        .eq('id', participantId)
        .maybeSingle();

      if (cancelled) return;
      if (!meData) {
        setState('notFound');
        return;
      }

      const { data: assignmentData } = await supabase
        .from('assignments')
        .select('*')
        .eq('giver_id', participantId)
        .maybeSingle();

      if (cancelled) return;
      if (!assignmentData) {
        setState('notFound');
        return;
      }

      const assignment = assignmentData as Assignment;
      const { data: receiverData } = await supabase
        .from('participants')
        .select('*')
        .eq('id', assignment.receiver_id)
        .maybeSingle();

      if (cancelled) return;
      if (!receiverData) {
        setState('notFound');
        return;
      }

      setMe(meData as Participant & { groups: Group });
      setGroup((meData as Participant & { groups: Group }).groups ?? null);
      setReceiver(receiverData);
      setState('ready');
    })();

    return () => {
      cancelled = true;
    };
  }, [participantId]);

  if (state === 'loading') {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <p className="text-center text-sm text-muted">Carregando seu resultado...</p>
        </Card>
      </section>
    );
  }

  if (state === 'notFound' || !me || !receiver) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <Card>
          <div className="rounded-card bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            Não encontramos seu sorteio. Confira se o link está completo e tente
            novamente.
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Card>
        <p className="text-sm font-semibold uppercase tracking-wide text-accent">
          {group?.name ?? 'Seu amigo secreto'}
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-primary">
          Olá, {me.name}!
        </h1>
        <p className="mt-1 text-sm text-muted">
          Guardem segredo — este link mostra apenas o seu resultado.
        </p>

        <div className="mt-8 rounded-card border border-accent-soft bg-accent-tint p-6 text-center">
          <p className="text-sm font-semibold text-accent-deep">Você tirou</p>
          <p className="mt-2 font-display text-3xl font-bold text-accent-dark">
            {receiver.name}
          </p>
          {group?.budget_hint && (
            <p className="mt-2 text-sm font-semibold text-body">
              Valor sugerido: {group.budget_hint}
            </p>
          )}
        </div>

        {receiver.wishlist && (
          <div className="mt-6 rounded-card border border-line bg-background p-5">
            <p className="text-sm font-semibold text-body">
              Dica de {receiver.name.split(' ')[0]}:
            </p>
            <p className="mt-1 text-sm text-muted">{receiver.wishlist}</p>
          </div>
        )}
      </Card>
    </section>
  );
}
