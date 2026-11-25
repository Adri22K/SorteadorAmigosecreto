'use client';

import { FormEvent, useMemo, useState } from 'react';
import type { Group, Participant } from '@/lib/types';
import Button from './Button';
import Card from './Card';
import StepIndicator from './StepIndicator';
import ShareLinks from './ShareLinks';

const steps = ['Grupo', 'Participantes', 'Sorteio'];
type PersonDraft = { name: string; wishlist: string; contact: string; partnerIndex: number | null };

function parseContact(contact: string): { phone: string | null; email: string | null } {
  const value = contact.trim();
  if (!value) return { phone: null, email: null };
  if (value.includes('@')) return { phone: null, email: value.toLowerCase() };
  const digits = value.replace(/\D/g, '');
  return { phone: digits || null, email: null };
}

export default function CreateGroupFlow() {
  const [step, setStep] = useState(0);
  const [groupName, setGroupName] = useState('');
  const [budgetHint, setBudgetHint] = useState('');
  const [participants, setParticipants] = useState<PersonDraft[]>([
    { name: '', wishlist: '', contact: '', partnerIndex: null },
    { name: '', wishlist: '', contact: '', partnerIndex: null },
    { name: '', wishlist: '', contact: '', partnerIndex: null },
  ]);
  const [group, setGroup] = useState<Group | null>(null);
  const [savedParticipants, setSavedParticipants] = useState<Participant[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [drawDone, setDrawDone] = useState(false);

  const validParticipants = useMemo(() => participants.filter((p) => p.name.trim()), [participants]);

  function updateParticipant(i: number, field: keyof PersonDraft, value: string | number | null) {
    setParticipants((prev) => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  }

  function setPartner(i: number, value: string) {
    const partnerIndex = value === '' ? null : Number(value);
    setParticipants((prev) => {
      const next = prev.map((p) => ({ ...p }));
      const old = next[i].partnerIndex;
      if (old !== null && next[old]?.partnerIndex === i) next[old].partnerIndex = null;
      next[i].partnerIndex = partnerIndex;
      if (partnerIndex !== null) {
        const previousPartner = next[partnerIndex].partnerIndex;
        if (previousPartner !== null && next[previousPartner]?.partnerIndex === partnerIndex) next[previousPartner].partnerIndex = null;
        next[partnerIndex].partnerIndex = i;
      }
      return next;
    });
  }

  function goToParticipants(e: FormEvent) {
    e.preventDefault(); setError('');
    if (groupName.trim().length < 3) { setError('Dê um nome ao grupo com pelo menos 3 letras.'); return; }
    setStep(1);
  }

  function goToDraw() {
    setError('');
    if (validParticipants.length < 3) { setError('Adicione pelo menos 3 participantes.'); return; }
    if (validParticipants.length > 20) { setError('O limite é de 20 participantes por grupo.'); return; }
    const indexMap = participants.map((p, i) => p.name.trim() ? i : -1).filter((i) => i >= 0);
    const validSet = new Set(indexMap);
    for (const originalIndex of indexMap) {
      const partner = participants[originalIndex].partnerIndex;
      if (partner !== null && (!validSet.has(partner) || participants[partner].partnerIndex !== originalIndex)) {
        setError('Confira os casais: os dois participantes precisam estar cadastrados e vinculados entre si.'); return;
      }
    }
    // Convert original row indexes into compact participant indexes for the API.
    setStep(2);
  }

  async function saveAndDraw() {
    setError(''); setSaving(true);
    try {
      const indexMap = participants.map((p, i) => p.name.trim() ? i : -1).filter((i) => i >= 0);
      const compactIndex = new Map(indexMap.map((original, compact) => [original, compact]));
      const payload = validParticipants.map((p, compact) => {
        const originalIndex = indexMap[compact];
        const contact = parseContact(p.contact);
        return {
          name: p.name.trim(), wishlist: p.wishlist.trim() || null,
          ...contact,
          partnerIndex: p.partnerIndex === null ? null : (compactIndex.get(p.partnerIndex) ?? null),
        };
      });
      const response = await fetch('/api/draw', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupName: groupName.trim(), budgetHint: budgetHint.trim(), participants: payload }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Não foi possível realizar o sorteio.');
      setGroup(data.group);
      setSavedParticipants(data.participants);
      setDrawDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado. Tente novamente.');
    } finally { setSaving(false); }
  }

  if (drawDone && group && savedParticipants.length) {
    return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <StepIndicator steps={steps} current={3} />
      <Card className="mt-6">
        <div className="rounded-card bg-accent-tint px-4 py-3 text-sm font-semibold text-accent-deep">Sorteio concluído! Envie a cada pessoa somente o link individual dela.</div>
        <h1 className="mt-6 font-display text-2xl font-bold text-primary">{group.name}</h1>
        <p className="mt-1 text-sm text-muted">Cada link revela apenas o resultado do participante correspondente.</p>
        <ShareLinks group={group} participants={savedParticipants} />
      </Card>
    </section>;
  }

  return <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
    <StepIndicator steps={steps} current={step} />
    <Card className="mt-6">
      {error && <div role="alert" className="mb-6 rounded-card bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</div>}
      {step === 0 && <form onSubmit={goToParticipants}>
        <h1 className="font-display text-2xl font-bold text-primary">Vamos começar pelo grupo</h1>
        <p className="mt-1 text-sm text-muted">Defina o nome e, se quiser, o valor sugerido para os presentes.</p>
        <div className="mt-6 space-y-5">
          <label className="block text-sm font-semibold text-body">Nome do grupo
            <input required minLength={3} maxLength={100} value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Ex.: Amigo secreto da família" className="mt-1.5 w-full rounded-card border border-line bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>
          <label className="block text-sm font-semibold text-body">Valor sugerido (opcional)
            <input value={budgetHint} onChange={(e) => setBudgetHint(e.target.value)} placeholder="Ex.: até R$ 50" className="mt-1.5 w-full rounded-card border border-line bg-background px-4 py-3 text-sm outline-none focus:border-primary" />
          </label>
        </div>
        <div className="mt-8 flex justify-end"><Button type="submit">Continuar</Button></div>
      </form>}
      {step === 1 && <div>
        <h1 className="font-display text-2xl font-bold text-primary">Quem participa?</h1>
        <p className="mt-1 text-sm text-muted">Cadastre de 3 a 20 pessoas. Se duas pessoas formam um casal, vincule uma à outra em “Não pode tirar”.</p>
        <div className="mt-6 space-y-4">
          {participants.map((p, i) => <div key={i} className="rounded-card border border-line bg-background p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <input value={p.name} onChange={(e) => updateParticipant(i, 'name', e.target.value)} placeholder={`Nome da pessoa ${i + 1}`} className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <input value={p.contact} onChange={(e) => updateParticipant(i, 'contact', e.target.value)} placeholder="WhatsApp ou e-mail (opcional)" className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <input value={p.wishlist} onChange={(e) => updateParticipant(i, 'wishlist', e.target.value)} placeholder="Dica de presente (opcional)" className="w-full rounded-card border border-line bg-surface px-4 py-2.5 text-sm outline-none focus:border-primary" />
              <label className="text-xs font-semibold text-muted">Não pode tirar
                <select value={p.partnerIndex ?? ''} onChange={(e) => setPartner(i, e.target.value)} className="mt-1 block w-full rounded-card border border-line bg-surface px-3 py-2.5 text-sm text-body">
                  <option value="">Ninguém (sem restrição)</option>
                  {participants.map((candidate, j) => j !== i && candidate.name.trim() && <option key={j} value={j}>{candidate.name.trim()}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted">
              {p.partnerIndex !== null ? <span>Vínculo de casal: {participants[p.partnerIndex]?.name || 'participante selecionado'}</span> : <span>Sem restrição de casal</span>}
              <button type="button" onClick={() => setParticipants((prev) => {
                const removed = prev.filter((_, idx) => idx !== i).map((person) => ({ ...person }));
                return removed.map((person) => ({ ...person, partnerIndex: person.partnerIndex === i ? null : person.partnerIndex !== null && person.partnerIndex > i ? person.partnerIndex - 1 : person.partnerIndex }));
              })} disabled={participants.length <= 3} className="rounded-pill px-3 py-1 text-xs font-semibold text-error hover:bg-error/10 disabled:opacity-40">Remover</button>
            </div>
          </div>)}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="soft" disabled={participants.length >= 20} onClick={() => setParticipants((prev) => [...prev, { name: '', wishlist: '', contact: '', partnerIndex: null }])}>Adicionar pessoa</Button>
        </div>
        <div className="mt-8 flex items-center justify-between"><Button variant="soft" onClick={() => setStep(0)}>Voltar</Button><Button onClick={goToDraw}>Continuar</Button></div>
      </div>}
      {step === 2 && <div>
        <h1 className="font-display text-2xl font-bold text-primary">Confira e faça o sorteio</h1>
        <p className="mt-1 text-sm text-muted">{validParticipants.length} pessoas participarão. As restrições de casal serão respeitadas.</p>
        <ul className="mt-6 divide-y divide-line rounded-card border border-line">
          {validParticipants.map((p, i) => <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm"><span className="font-semibold text-body">{p.name.trim()}</span><span className="text-xs text-muted">{p.partnerIndex !== null ? `Casal: ${participants[p.partnerIndex]?.name}` : 'Sem restrição'}</span></li>)}
        </ul>
        <div className="mt-8 flex items-center justify-between"><Button variant="soft" onClick={() => setStep(1)} disabled={saving}>Voltar</Button><Button onClick={saveAndDraw} disabled={saving}>{saving ? 'Sorteando...' : 'Fazer o sorteio'}</Button></div>
      </div>}
    </Card>
  </section>;
}
