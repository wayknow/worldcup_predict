import Taro from '@tarojs/taro';

/**
 * 用户预测数据结构
 * - first:  第1名队伍 code（必选）
 * - second: 第2名队伍 code（必选）
 * - third:  第3名队伍 code（可选，只有 8 组需要选）
 * 第4名不需要记录，剩下的队伍就是第4名
 */
export interface GroupPrediction {
  first: string | null;
  second: string | null;
  third: string | null;
}

export type AllPredictions = Record<string, GroupPrediction>; // key = group id A-L

const STORAGE_KEY = 'worldcup2026_predictions';

export function getPredictions(): AllPredictions {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function savePredictions(predictions: AllPredictions): void {
  Taro.setStorageSync(STORAGE_KEY, JSON.stringify(predictions));
}

export function saveGroupPrediction(groupId: string, prediction: GroupPrediction): AllPredictions {
  const all = getPredictions();
  all[groupId] = prediction;
  savePredictions(all);
  return all;
}

export function clearPredictions(): void {
  Taro.removeStorageSync(STORAGE_KEY);
}

/** 统计第1+第2名都已选的组数 */
export function countFirstSecondDone(predictions: AllPredictions): number {
  return Object.values(predictions).filter(p => p.first && p.second).length;
}

/** 统计已选第3名的组数 */
export function countThirdSelected(predictions: AllPredictions): number {
  return Object.values(predictions).filter(p => !!p.third).length;
}

export const TOTAL_GROUPS = 12;
export const BEST_THIRD_COUNT = 8;

// ====================================================================
// 淘汰赛预测
// ====================================================================

/** 淘汰赛预测：每场比赛的胜者是 team1 还是 team2，null 表示未选择 */
export type KnockoutPredictions = Record<string, 'team1' | 'team2' | null>;

const KNOCKOUT_KEY = 'worldcup2026_knockout_picks';

export function getKnockoutPredictions(): KnockoutPredictions {
  try {
    const data = Taro.getStorageSync(KNOCKOUT_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveKnockoutPick(matchId: string, pick: 'team1' | 'team2' | null): KnockoutPredictions {
  const all = getKnockoutPredictions();
  if (pick === null) {
    delete all[matchId];
  } else {
    all[matchId] = pick;
  }
  Taro.setStorageSync(KNOCKOUT_KEY, JSON.stringify(all));
  return all;
}

export function clearKnockoutPredictions(): void {
  Taro.removeStorageSync(KNOCKOUT_KEY);
}

/** 清除全部数据（小组 + 淘汰赛） */
export function clearAllData(): void {
  clearPredictions();
  clearKnockoutPredictions();
  clearThirdSlotAssignments();
}

// ====================================================================
// 最佳第3名对阵槽位分配
// ====================================================================

/** 第3名槽位分配：key = "matchId-teamN"（如 "M74-team2"），value = teamCode */
export type ThirdSlotAssignments = Record<string, string>;

const THIRD_SLOTS_KEY = 'worldcup2026_third_slots';

export function getThirdSlotAssignments(): ThirdSlotAssignments {
  try {
    const data = Taro.getStorageSync(THIRD_SLOTS_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

export function saveThirdSlotAssignment(slotKey: string, teamCode: string | null): ThirdSlotAssignments {
  const all = getThirdSlotAssignments();
  if (teamCode === null) {
    delete all[slotKey];
  } else {
    all[slotKey] = teamCode;
  }
  Taro.setStorageSync(THIRD_SLOTS_KEY, JSON.stringify(all));
  return all;
}

export function clearThirdSlotAssignments(): void {
  Taro.removeStorageSync(THIRD_SLOTS_KEY);
  Taro.removeStorageSync(THIRD_RANKING_KEY);
}

// ====================================================================
// 最佳第3名排名（第1好→第8好）
// ====================================================================

const THIRD_RANKING_KEY = 'worldcup2026_third_ranking';

export function getThirdTeamRanking(): string[] {
  try {
    const data = Taro.getStorageSync(THIRD_RANKING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveThirdTeamRanking(ranking: string[]): string[] {
  Taro.setStorageSync(THIRD_RANKING_KEY, JSON.stringify(ranking));
  return ranking;
}

// ====================================================================
// 用户信息（昵称、头像）
// ====================================================================

export interface UserInfo {
  nickname: string;
  avatarUrl: string;
}

const USER_INFO_KEY = 'worldcup2026_user_info';

export function getUserInfo(): UserInfo | null {
  try {
    const data = Taro.getStorageSync(USER_INFO_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function saveUserInfo(info: UserInfo): void {
  Taro.setStorageSync(USER_INFO_KEY, JSON.stringify(info));
}

// ====================================================================
// 报告生成时间戳
// ====================================================================

const REPORT_TIME_KEY = 'worldcup2026_report_time';

export function getReportTime(): string | null {
  try {
    return Taro.getStorageSync(REPORT_TIME_KEY) || null;
  } catch {
    return null;
  }
}

export function saveReportTime(time: string): void {
  Taro.setStorageSync(REPORT_TIME_KEY, time);
}
