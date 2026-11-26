import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { getSupabaseAdmin } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const supabaseAdmin = getSupabaseAdmin();
  const token = params.token;
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.json({ error: 'Link inválido ou inexistente.' }, { status: 404 });
  }

  const tokenHash = createHash('sha256').update(token).digest('hex');
  const { data: me, error: meError } = await supabaseAdmin
    .from('participants')
    .select('id,name,group_id')
    .eq('result_token_hash', tokenHash)
    .maybeSingle();

  if (meError || !me) return NextResponse.json({ error: 'Link inválido ou inexistente.' }, { status: 404 });

  const [{ data: group }, { data: assignment }] = await Promise.all([
    supabaseAdmin.from('groups').select('name,budget_hint').eq('id', me.group_id).maybeSingle(),
    supabaseAdmin.from('assignments').select('receiver_id').eq('giver_id', me.id).maybeSingle(),
  ]);
  if (!assignment) return NextResponse.json({ error: 'Seu sorteio ainda não está disponível.' }, { status: 404 });

  const { data: receiver } = await supabaseAdmin
    .from('participants').select('name,wishlist').eq('id', assignment.receiver_id).maybeSingle();
  if (!receiver) return NextResponse.json({ error: 'Resultado indisponível.' }, { status: 404 });

  return NextResponse.json({
    participantName: me.name,
    groupName: group?.name ?? 'Seu amigo secreto',
    budgetHint: group?.budget_hint ?? null,
    receiverName: receiver.name,
    wishlist: receiver.wishlist,
  }, { headers: { 'Cache-Control': 'no-store, private' } });
}
