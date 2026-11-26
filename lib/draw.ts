import { randomInt } from 'node:crypto';

export interface DrawPerson {
  id: string;
  partnerId?: string | null;
}

function secureShuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Produces a one-to-one derangement while respecting mutual couple exclusions.
 * Backtracking is practical for the app's intended 3–20 participants.
 */
export function shuffleAssignments(
  participants: DrawPerson[],
): { giver_id: string; receiver_id: string }[] {
  if (participants.length < 3) throw new Error('São necessários pelo menos 3 participantes.');
  if (participants.length > 20) throw new Error('O limite é de 20 participantes.');

  const ids = participants.map((p) => p.id);
  if (new Set(ids).size !== ids.length) throw new Error('Existem participantes duplicados.');

  const byId = new Map(participants.map((p) => [p.id, p]));
  for (const p of participants) {
    if (p.partnerId && (!byId.has(p.partnerId) || p.partnerId === p.id)) {
      throw new Error('A configuração de casal é inválida.');
    }
    if (p.partnerId && byId.get(p.partnerId)?.partnerId !== p.id) {
      throw new Error('O vínculo de casal precisa estar definido nos dois participantes.');
    }
  }

  const result = new Map<string, string>();
  const remaining = new Set(ids);

  // Randomize giver order too, preserving unbiased ordering.
  const givers = secureShuffle(ids);
  // Local recursion over randomized giver order.
  function solve(index: number): boolean {
    if (index === givers.length) return true;
    const giver = givers[index];
    const partnerId = byId.get(giver)!.partnerId;
    const options = secureShuffle([...remaining]).filter(
      (receiver) => receiver !== giver && receiver !== partnerId,
    );
    for (const receiver of options) {
      result.set(giver, receiver);
      remaining.delete(receiver);
      if (solve(index + 1)) return true;
      remaining.add(receiver);
      result.delete(giver);
    }
    return false;
  }

  if (!solve(0)) {
    throw new Error('Não foi possível realizar um sorteio com essas restrições. Ajuste os casais ou participantes.');
  }
  return [...result.entries()].map(([giver_id, receiver_id]) => ({ giver_id, receiver_id }));
}
