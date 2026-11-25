'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { shuffleAssignments } from '@/lib/draw';
import type { Group, Participant } from '@/lib/types';
import Button from './Button';
import Card from './Card';
import StepIndicator from './StepIndicator';
import ShareLinks from './ShareLinks';

const steps = ['Grupo', 'Participantes', 'Sorteio'];

function parseContact(contact: string): { phone: string | null; email: string | null } {
  const value = contact.trim();
  if (!value) return { phone: null, email: null };
  if (value.includes('@')) return { phone: null, email: value.toLowerCase() };
  const digits = value.replace(/\D/g, '');
  return { phone: digits || null, email: null };
}

export default function CreateGroupFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [budgetHint, setBudgetHint] = useState('');
  const [participants, setParticipants] = useState<
    { name: string; wishlist: string; contact: string }[]
  >([{ name: '', wishlist: '', contact: '' }]);
  const [group, setGroup] = useState<Group | null>(null);
  const [savedParticipants, setSavedParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [drawDone, setDrawDone] = useState(false);

  const validParticipants = useMemo(
    () => participants.filter((p) => p.name.trim().length > 0),
    [participants],
  );

  function updateParticipant(
    i: number,
    field: 'name' | 'wishlist' | 'contact',
    value: string,
  ) {
    setParticipants((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)),
    );
  }

  function goToParticipants(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (groupName.trim().length < 3) {
      setError('Dê um nome ao grupo com pelo menos 3 letras.');
      return;
    }
    setStep(1);
  }

  function goToDraw() {
    setError('');
    if (validParticipants.length < 3) {
      setError('Adicione pelo menos 3 participantes para o sorteio funcionar.');
      return;
    }
    setStep(2);
  }

  async function saveAndDraw() {
    setError('');
    setSaving(true);
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName.trim(),
          budget_hint: budgetHint.trim() || null,
        })
        .select()
        .single();
      if (groupError || !groupData) throw new Error(groupError?.message ?? 'Falha ao criar o grupo.');

      const rows = validParticipants.map((p) => ({
        group_id: groupData.id,
        name: p.name.trim(),
        wishlist: p.wishlist.trim() || null,
        ...parseContact(p.contact),
      }));
      const { data: participantsData, error: participantsError } = await supabase
        .from('participants')
        .insert(rows)
        .select();
      if (participantsError || !participantsData)
        throw new Error(participantsError?.message ?? 'Falha ao salvar participantes.');

      const assignments = shuffleAssignments(participantsData);
      const { error: assignmentsError } = await supabase
        .from('assignments')
        .insert(assignments.map((a) => ({ ...a, group_id: groupData.id })));
      if (assignmentsError) throw new Error(assignmentsError.message);

      setGroup(groupData);
      setSavedParticipants(participantsData);
      setDrawDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  if (drawDone && group && savedParticipants.length > 0) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <StepIndicator steps={steps} current={3} />
        <Card className="mt-6">
          <div className="rounded-card bg-primary-soft px-4 py-3 text-sm font-semibold text-primary">
            Sorteio concluído! Agora envie a cada pessoa o seu link individual.
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-primary">
            {group.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cada pessoa abre o próprio link e descobre quem tirou. Ninguém vê o
            resultado dos outros.
          </p>
          <ShareLinks group={group} participants={savedParticipants} />
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <StepIndicator steps={steps} current={step} />
      <Card className="mt-6">
        {error && (
          <div className="mb-6 rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">
            {error}
          </div>
        )}

        {step === 0 && (
          <form onSubmit={goToParticipants}>
            <h1 className="font-display text-2xl font-bold text-primary">
              Vamos começar pelo grupo
            </h1>
            <p className="mt-1 text-sm text-muted">
              Um nome claro ajuda as pessoas a saberem de qual festa é o sorteio.
            </p>
            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="group-name"
                  className="mb-1.5 block text-sm font-semibold text-body"
                >
                  Nome do grupo
                </label>
                <input
                  id="group-name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Ex.: Amigo secreto da família"
                  className="w-full rounded-card border border-line bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="budget"
                  className="mb-1.5 block text-sm font-semibold text-body"
                >
                  Valor sugerido (opcional)
                </label>
                <input
                  id="budget"
                  value={budgetHint}
                  onChange={(e) => setBudgetHint(e.target.value)}
                  placeholder="Ex.: até R$ 50"
                  className="w-full rounded-card border border-line bg-background px-4 py-3 text-sm outline-none transition focus:border-primary"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <Button type="submit">Continuar</Button>
            </div>
          </form>
        )}

        {step === 1 && (
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">
              Quem participa?
            </h1>
            <p className="mt-1 text-sm text-muted">
              Adicione nome e, se quiser, um contato e uma dica de presente para
              cada pessoa. Com o contato, você envia o resultado direto pro
              WhatsApp ou e-mail dela.
            </p>
            <div className="mt-6 space-y-4">
              {participants.map((p, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-card border border-line bg-background p-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-center"
                >
                  <input
                    value={p.name}
                    onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                    placeholder={`Nome da pessoa ${i + 1}`}
                    className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                  />
                  <input
                    value={p.contact}
                    onChange={(e) => updateParticipant(i, 'contact', e.target.value)}
                    placeholder="Zap ou e-mail (opcional)"
                    className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                  />
                  <input
                    value={p.wishlist}
                    onChange={(e) => updateParticipant(i, 'wishlist', e.target.value)}
                    placeholder="Dica de presente (opcional)"
                    className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none transition focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setParticipants((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    disabled={participants.length <= 3}
                    className="justify-self-end rounded-pill px-3 py-1.5 text-xs font-semibold text-error transition hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Remover pessoa ${i + 1}`}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-5">
              <Button
                variant="soft"
                onClick={() =>
                  setParticipants((prev) => [
                    ...prev,
                    { name: '', wishlist: '', contact: '' },
                  ])
                }
              >
                Adicionar pessoa
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <Button variant="soft" onClick={() => setStep(0)}>
                Voltar
              </Button>
              <Button onClick={goToDraw}>Continuar</Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="font-display text-2xl font-bold text-primary">
              Confira e faça o sorteio
            </h1>
            <p className="mt-1 text-sm text-muted">
              {validParticipants.length} pessoas vão participar. Depois do sorteio,
              cada pessoa recebe um link privado com o próprio resultado.
            </p>
            <ul className="mt-6 divide-y divide-line rounded-card border border-line">
              {validParticipants.map((p, i) => (
                <li key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-body">{p.name.trim()}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex items-center justify-between">
              <Button variant="soft" onClick={() => setStep(1)} disabled={saving}>
                Voltar
              </Button>
              <Button onClick={saveAndDraw} disabled={saving}>
                {saving ? 'Sorteando...' : 'Fazer o sorteio'}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </section>
  );
}
