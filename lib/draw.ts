import type { Participant } from './types';

/**
 * Sorteia um ciclo único: as pessoas são embaralhadas numa "roda" e cada uma
 * tira a seguinte. Assim ninguém tira a si mesmo e nenhuma dupla se tira
 * em par (não existem ciclos de 2 pessoas).
 */
export function shuffleAssignments(
  participants: Participant[],
): { giver_id: string; receiver_id: string }[] {
  const wheel = FisherYatesShuffle(participants.map((p) => p.id));

  return wheel.map((giver_id, i) => ({
    giver_id,
    receiver_id: wheel[(i + 1) % wheel.length],
  }));
}

function FisherYatesShuffle(arr: string[]): string[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
