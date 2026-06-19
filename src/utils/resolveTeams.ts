import { GROUPS, Team } from '../data/groups';
import { BracketSlot, KnockoutMatch, ALL_KNOCKOUT_MATCHES } from '../data/knockout';
import { AllPredictions, ThirdSlotAssignments } from './storage';

function getGroupRankTeam(predictions: AllPredictions, groupId: string, rank: number): string | null {
  const pred = predictions[groupId];
  if (!pred) return null;
  if (rank === 1) return pred.first;
  if (rank === 2) return pred.second;
  if (rank === 3) return pred.third;
  return null;
}

export interface ResolvedTeam {
  code: string | null;
  flag: string;
  name: string;
}

function getTeamByCode(code: string | null): Team | null {
  if (!code) return null;
  for (const g of GROUPS) {
    const t = g.teams.find(t => t.code === code);
    if (t) return t;
  }
  return null;
}

/** 把 teamCode 转为 ResolvedTeam */
function codeToResolved(code: string | null, fallback: string): ResolvedTeam {
  const team = getTeamByCode(code);
  return {
    code,
    flag: team?.flag ?? '',
    name: team?.name ?? fallback,
  };
}

function resolveGroupSlot(
  predictions: AllPredictions,
  thirdSlots: ThirdSlotAssignments,
  slot: BracketSlot,
  slotKey: string, // 如 "M74-team2"
): ResolvedTeam {
  const src = slot.source;
  const simple = src.match(/^([12])([A-L])$/);
  if (simple) {
    const code = getGroupRankTeam(predictions, simple[2], parseInt(simple[1]));
    return codeToResolved(code, slot.label);
  }

  // 第3名槽位：检查是否有手动分配
  const assignedCode = thirdSlots[slotKey];
  if (assignedCode) {
    return codeToResolved(assignedCode, slot.label);
  }

  return { code: null, flag: '', name: slot.label };
}

function resolveWinnerSlot(
  predictions: AllPredictions,
  knockoutPredictions: Record<string, 'team1' | 'team2' | null>,
  thirdSlots: ThirdSlotAssignments,
  slot: BracketSlot,
  slotKey: string,
): ResolvedTeam {
  const prevId = slot.source;
  const prevMatch = ALL_KNOCKOUT_MATCHES.find(m => m.id === prevId);
  if (!prevMatch) return { code: null, flag: '', name: slot.label };

  const pick = knockoutPredictions[prevId];
  if (!pick) return { code: null, flag: '', name: `W${prevId}` };

  const winnerSlot = pick === 'team1' ? prevMatch.team1 : prevMatch.team2;
  const winnerKey = pick === 'team1' ? `${prevId}-team1` : `${prevId}-team2`;

  if (winnerSlot.sourceType === 'group') {
    return resolveGroupSlot(predictions, thirdSlots, winnerSlot, winnerKey);
  }
  return resolveWinnerSlot(predictions, knockoutPredictions, thirdSlots, winnerSlot, winnerKey);
}

function resolveLoserSlot(
  predictions: AllPredictions,
  knockoutPredictions: Record<string, 'team1' | 'team2' | null>,
  thirdSlots: ThirdSlotAssignments,
  matchId: string,
): ResolvedTeam {
  const match = ALL_KNOCKOUT_MATCHES.find(m => m.id === matchId);
  if (!match) return { code: null, flag: '', name: '?' };

  const pick = knockoutPredictions[matchId];
  if (!pick) return { code: null, flag: '', name: `L${matchId}` };

  const loserSlot = pick === 'team1' ? match.team2 : match.team1;
  const loserKey = pick === 'team1' ? `${matchId}-team2` : `${matchId}-team1`;

  if (loserSlot.sourceType === 'group') {
    return resolveGroupSlot(predictions, thirdSlots, loserSlot, loserKey);
  }
  return resolveWinnerSlot(predictions, knockoutPredictions, thirdSlots, loserSlot, loserKey);
}

/** 对外的统一解析入口 */
export function resolveMatchTeams(
  predictions: AllPredictions,
  knockoutPredictions: Record<string, 'team1' | 'team2' | null>,
  thirdSlots: ThirdSlotAssignments,
  match: KnockoutMatch,
): { team1: ResolvedTeam; team2: ResolvedTeam } {
  // 三四名决赛：取半决赛负者
  if (match.id === 'M103') {
    return {
      team1: resolveLoserSlot(predictions, knockoutPredictions, thirdSlots, 'M101'),
      team2: resolveLoserSlot(predictions, knockoutPredictions, thirdSlots, 'M102'),
    };
  }

  const resolveOne = (slot: BracketSlot, key: string): ResolvedTeam => {
    if (slot.sourceType === 'group') {
      return resolveGroupSlot(predictions, thirdSlots, slot, key);
    }
    return resolveWinnerSlot(predictions, knockoutPredictions, thirdSlots, slot, key);
  };

  return {
    team1: resolveOne(match.team1, `${match.id}-team1`),
    team2: resolveOne(match.team2, `${match.id}-team2`),
  };
}

/**
 * 检查是否为第3名槽位（需要手动分配的）
 */
export function isThirdPlaceSlot(slot: BracketSlot): boolean {
  return slot.sourceType === 'group' && /^3[A-L](\/[A-L])*$/.test(slot.source);
}

/**
 * 获取所有需要手动分配的第3名槽位
 */
export function getThirdPlaceSlots(): Array<{ matchId: string; side: 'team1' | 'team2'; slot: BracketSlot }> {
  const result: Array<{ matchId: string; side: 'team1' | 'team2'; slot: BracketSlot }> = [];
  ALL_KNOCKOUT_MATCHES
    .filter(m => m.round === 1)
    .forEach(m => {
      if (isThirdPlaceSlot(m.team1)) result.push({ matchId: m.id, side: 'team1', slot: m.team1 });
      if (isThirdPlaceSlot(m.team2)) result.push({ matchId: m.id, side: 'team2', slot: m.team2 });
    });
  return result;
}
