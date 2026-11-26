import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash, randomUUID } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';
import { shuffleAssignments } from '@/lib/draw';

export const runtime = 'nodejs';

type InputPerson = {
  name: string;
  wishlist?: string;
  phone?: string | null;
  email?: string | null;
  partnerIndex?: number | null;
};

export async function POST(request: NextRequest) {
  let createdGroupId: string | null = null;
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const body = await request.json();
    const name = String(body.groupName ?? '').trim();
    const budgetHint = String(body.budgetHint ?? '').trim() || null;
    const people = body.participants as InputPerson[];

    if (name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: 'O nome do grupo deve ter entre 3 e 100 caracteres.' }, { status: 400 });
    }
    if (!Array.isArray(people) || people.length < 3 || people.length > 20) {
      return NextResponse.json({ error: 'Adicione de 3 a 20 participantes.' }, { status: 400 });
    }
    if (people.some((p) => !p || typeof p.name !== 'string' || !p.name.trim() || p.name.trim().length > 100)) {
      return NextResponse.json({ error: 'Todos os participantes precisam ter um nome válido.' }, { status: 400 });
    }

    const partnerIds: (number | null)[] = people.map((p) =>
      Number.isInteger(p.partnerIndex) ? p.partnerIndex! : null,
    );
    for (let i = 0; i < partnerIds.length; i++) {
      const partner = partnerIds[i];
      if (partner === null) continue;
      if (partner < 0 || partner >= people.length || partner === i || partnerIds[partner] !== i) {
        return NextResponse.json({ error: 'Cada casal deve estar vinculado nos dois participantes.' }, { status: 400 });
      }
    }

    const { data: group, error: groupError } = await supabaseAdmin
      .from('groups').insert({ name, budget_hint: budgetHint }).select('id,name,budget_hint,created_at').single();
    if (groupError || !group) throw new Error(groupError?.message || 'Não foi possível criar o grupo.');
    createdGroupId = group.id;

    const tokens = people.map(() => randomBytes(32).toString('hex'));
    const participantRows = people.map((p, i) => ({
      client_ref: randomUUID(),
      group_id: group.id,
      name: p.name.trim(),
      wishlist: String(p.wishlist ?? '').trim() || null,
      phone: p.phone || null,
      email: p.email || null,
      result_token_hash: createHash('sha256').update(tokens[i]).digest('hex'),
    }));

    const { data: saved, error: peopleError } = await supabaseAdmin
      .from('participants').insert(participantRows)
      .select('id,client_ref,name,wishlist,phone,email,group_id,created_at');
    if (peopleError || !saved || saved.length !== people.length) throw new Error(peopleError?.message || 'Não foi possível salvar os participantes.');

    const savedByRef = new Map(saved.map((p: any) => [p.client_ref, p]));
    const ordered = people.map((p, i) => ({ id: savedByRef.get(participantRows[i].client_ref)!.id, partnerId: partnerIds[i] === null ? null : savedByRef.get(participantRows[partnerIds[i]!].client_ref)!.id }));
    const assignments = shuffleAssignments(ordered).map((a) => ({ ...a, group_id: group.id }));
    const { error: assignmentError } = await supabaseAdmin.from('assignments').insert(assignments);
    if (assignmentError) throw new Error(assignmentError.message);

    const origin = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin;
    return NextResponse.json({
      group,
      participants: people.map((_, i) => { const p: any = savedByRef.get(participantRows[i].client_ref); return { id: p.id, name: p.name, wishlist: p.wishlist, phone: p.phone, email: p.email, group_id: p.group_id, created_at: p.created_at, resultUrl: `${origin}/eu/${tokens[i]}` }; }),
    });
  } catch (error) {
    if (createdGroupId) {
      await getSupabaseAdmin().from('groups').delete().eq('id', createdGroupId);
    }
    const message = error instanceof Error ? error.message : 'Não foi possível concluir o sorteio.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
