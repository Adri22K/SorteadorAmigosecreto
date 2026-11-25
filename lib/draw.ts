import type { Participant } from './types';

/**
 * Sorteia um ciclo único: cada pessoa tira outra, ninguém tira a si mesmo
 * e todos são sorteados exatamente uma vez.
 */
export function shuffleAssignments(
  participants: Participant[],
): { giver_id: string; receiver_id: string }[] {
  const ids = participants.map((p) => p.id);

  let result: string[];
  for (;;) {
    result = FisherYatesShuffle(ids);
    const valid = result.every((receiver, i) => receiver !== ids[i]);
    if (valid) break;
  }

  return ids.map((giver_id, i) => ({ giver_id, receiver_id: result[i] }));
}

function FisherYatesShuffle(arr: string[]): string[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
