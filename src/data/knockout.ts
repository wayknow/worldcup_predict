/**
 * 2026 世界杯淘汰赛对阵表
 * 共 31 场比赛：R32(16) → R16(8) → QF(4) → SF(2) → 3RD(1) + F(1)
 */

/** 淘汰赛某队来源：从小组赛晋级 或 从前一场胜出 */
export interface BracketSlot {
  /** 来源类型 */
  sourceType: 'group' | 'winner';
  /** 来源标识，如 '1A'（A组第1）或 'M73'（M73胜者） */
  source: string;
  /** 显示标签 */
  label: string;
  /** 如果是小组晋级，包含可能的组别（用于第3名多组来源场景） */
  possibleGroups?: string[];
}

export interface KnockoutMatch {
  id: string;           // M73-M104
  round: number;        // 1=R32, 2=R16, 3=QF, 4=SF, 5=3RD, 6=F
  roundLabel: string;   // 中文标签
  date: string;
  venue: string;
  team1: BracketSlot;
  team2: BracketSlot;
}

/** 无球队占位符 */
export const TBD = '待定';

export const ROUND_LABELS: Record<number, string> = {
  1: '32 强赛',
  2: '16 强赛',
  3: '¼ 决赛',
  4: '½ 决赛',
  5: '三四名决赛',
  6: '🏆 决赛',
};

// ====== 32 强对阵表 ======

export const R32_MATCHES: KnockoutMatch[] = [
  {
    id: 'M73', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月28日', venue: '洛杉矶',
    team1: { sourceType: 'group', source: '2A', label: 'A组第2', possibleGroups: ['A'] },
    team2: { sourceType: 'group', source: '2B', label: 'B组第2', possibleGroups: ['B'] },
  },
  {
    id: 'M74', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月29日', venue: '波士顿',
    team1: { sourceType: 'group', source: '1E', label: 'E组第1', possibleGroups: ['E'] },
    team2: { sourceType: 'group', source: '3A/B/C/D/F', label: '最佳第3名', possibleGroups: ['A', 'B', 'C', 'D', 'F'] },
  },
  {
    id: 'M75', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月29日', venue: '蒙特雷',
    team1: { sourceType: 'group', source: '1F', label: 'F组第1', possibleGroups: ['F'] },
    team2: { sourceType: 'group', source: '2C', label: 'C组第2', possibleGroups: ['C'] },
  },
  {
    id: 'M76', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月29日', venue: '休斯顿',
    team1: { sourceType: 'group', source: '1C', label: 'C组第1', possibleGroups: ['C'] },
    team2: { sourceType: 'group', source: '2F', label: 'F组第2', possibleGroups: ['F'] },
  },
  {
    id: 'M77', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月30日', venue: '纽约/新泽西',
    team1: { sourceType: 'group', source: '1I', label: 'I组第1', possibleGroups: ['I'] },
    team2: { sourceType: 'group', source: '3C/D/F/G/H', label: '最佳第3名', possibleGroups: ['C', 'D', 'F', 'G', 'H'] },
  },
  {
    id: 'M78', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月30日', venue: '达拉斯',
    team1: { sourceType: 'group', source: '2E', label: 'E组第2', possibleGroups: ['E'] },
    team2: { sourceType: 'group', source: '2I', label: 'I组第2', possibleGroups: ['I'] },
  },
  {
    id: 'M79', round: 1, roundLabel: ROUND_LABELS[1],
    date: '6月30日', venue: '墨西哥城',
    team1: { sourceType: 'group', source: '1A', label: 'A组第1', possibleGroups: ['A'] },
    team2: { sourceType: 'group', source: '3C/E/F/H/I', label: '最佳第3名', possibleGroups: ['C', 'E', 'F', 'H', 'I'] },
  },
  {
    id: 'M80', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月1日', venue: '亚特兰大',
    team1: { sourceType: 'group', source: '1L', label: 'L组第1', possibleGroups: ['L'] },
    team2: { sourceType: 'group', source: '3E/H/I/J/K', label: '最佳第3名', possibleGroups: ['E', 'H', 'I', 'J', 'K'] },
  },
  {
    id: 'M81', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月1日', venue: '旧金山',
    team1: { sourceType: 'group', source: '1D', label: 'D组第1', possibleGroups: ['D'] },
    team2: { sourceType: 'group', source: '3B/E/F/I/J', label: '最佳第3名', possibleGroups: ['B', 'E', 'F', 'I', 'J'] },
  },
  {
    id: 'M82', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月1日', venue: '西雅图',
    team1: { sourceType: 'group', source: '1G', label: 'G组第1', possibleGroups: ['G'] },
    team2: { sourceType: 'group', source: '3A/E/H/I/J', label: '最佳第3名', possibleGroups: ['A', 'E', 'H', 'I', 'J'] },
  },
  {
    id: 'M83', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月2日', venue: '多伦多',
    team1: { sourceType: 'group', source: '2K', label: 'K组第2', possibleGroups: ['K'] },
    team2: { sourceType: 'group', source: '2L', label: 'L组第2', possibleGroups: ['L'] },
  },
  {
    id: 'M84', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月2日', venue: '洛杉矶',
    team1: { sourceType: 'group', source: '1H', label: 'H组第1', possibleGroups: ['H'] },
    team2: { sourceType: 'group', source: '2J', label: 'J组第2', possibleGroups: ['J'] },
  },
  {
    id: 'M85', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月2日', venue: '温哥华',
    team1: { sourceType: 'group', source: '1B', label: 'B组第1', possibleGroups: ['B'] },
    team2: { sourceType: 'group', source: '3E/F/G/I/J', label: '最佳第3名', possibleGroups: ['E', 'F', 'G', 'I', 'J'] },
  },
  {
    id: 'M86', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月3日', venue: '迈阿密',
    team1: { sourceType: 'group', source: '1J', label: 'J组第1', possibleGroups: ['J'] },
    team2: { sourceType: 'group', source: '2H', label: 'H组第2', possibleGroups: ['H'] },
  },
  {
    id: 'M87', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月3日', venue: '堪萨斯城',
    team1: { sourceType: 'group', source: '1K', label: 'K组第1', possibleGroups: ['K'] },
    team2: { sourceType: 'group', source: '3D/E/I/J/L', label: '最佳第3名', possibleGroups: ['D', 'E', 'I', 'J', 'L'] },
  },
  {
    id: 'M88', round: 1, roundLabel: ROUND_LABELS[1],
    date: '7月3日', venue: '达拉斯',
    team1: { sourceType: 'group', source: '2D', label: 'D组第2', possibleGroups: ['D'] },
    team2: { sourceType: 'group', source: '2G', label: 'G组第2', possibleGroups: ['G'] },
  },
];

// ====== 后续轮次（基于前一轮胜者） ======

export const LATER_MATCHES: KnockoutMatch[] = [
  // Round of 16 —— M89-M96
  { id: 'M89', round: 2, roundLabel: ROUND_LABELS[2], date: '7月4日', venue: '费城', team1: { sourceType: 'winner', source: 'M74', label: 'W74' }, team2: { sourceType: 'winner', source: 'M77', label: 'W77' } },
  { id: 'M90', round: 2, roundLabel: ROUND_LABELS[2], date: '7月4日', venue: '休斯顿', team1: { sourceType: 'winner', source: 'M73', label: 'W73' }, team2: { sourceType: 'winner', source: 'M75', label: 'W75' } },
  { id: 'M91', round: 2, roundLabel: ROUND_LABELS[2], date: '7月5日', venue: '纽约/新泽西', team1: { sourceType: 'winner', source: 'M76', label: 'W76' }, team2: { sourceType: 'winner', source: 'M78', label: 'W78' } },
  { id: 'M92', round: 2, roundLabel: ROUND_LABELS[2], date: '7月6日', venue: '墨西哥城', team1: { sourceType: 'winner', source: 'M79', label: 'W79' }, team2: { sourceType: 'winner', source: 'M80', label: 'W80' } },
  { id: 'M93', round: 2, roundLabel: ROUND_LABELS[2], date: '7月6日', venue: '达拉斯', team1: { sourceType: 'winner', source: 'M83', label: 'W83' }, team2: { sourceType: 'winner', source: 'M84', label: 'W84' } },
  { id: 'M94', round: 2, roundLabel: ROUND_LABELS[2], date: '7月7日', venue: '西雅图', team1: { sourceType: 'winner', source: 'M81', label: 'W81' }, team2: { sourceType: 'winner', source: 'M82', label: 'W82' } },
  { id: 'M95', round: 2, roundLabel: ROUND_LABELS[2], date: '7月7日', venue: '亚特兰大', team1: { sourceType: 'winner', source: 'M86', label: 'W86' }, team2: { sourceType: 'winner', source: 'M88', label: 'W88' } },
  { id: 'M96', round: 2, roundLabel: ROUND_LABELS[2], date: '7月7日', venue: '温哥华', team1: { sourceType: 'winner', source: 'M85', label: 'W85' }, team2: { sourceType: 'winner', source: 'M87', label: 'W87' } },
  // Quarter-finals —— M97-M100
  { id: 'M97', round: 3, roundLabel: ROUND_LABELS[3], date: '7月9日', venue: '波士顿', team1: { sourceType: 'winner', source: 'M89', label: 'W89' }, team2: { sourceType: 'winner', source: 'M90', label: 'W90' } },
  { id: 'M98', round: 3, roundLabel: ROUND_LABELS[3], date: '7月10日', venue: '洛杉矶', team1: { sourceType: 'winner', source: 'M93', label: 'W93' }, team2: { sourceType: 'winner', source: 'M94', label: 'W94' } },
  { id: 'M99', round: 3, roundLabel: ROUND_LABELS[3], date: '7月11日', venue: '迈阿密', team1: { sourceType: 'winner', source: 'M91', label: 'W91' }, team2: { sourceType: 'winner', source: 'M92', label: 'W92' } },
  { id: 'M100', round: 3, roundLabel: ROUND_LABELS[3], date: '7月12日', venue: '堪萨斯城', team1: { sourceType: 'winner', source: 'M95', label: 'W95' }, team2: { sourceType: 'winner', source: 'M96', label: 'W96' } },
  // Semi-finals —— M101-M102
  { id: 'M101', round: 4, roundLabel: ROUND_LABELS[4], date: '7月14日', venue: '达拉斯', team1: { sourceType: 'winner', source: 'M97', label: 'W97' }, team2: { sourceType: 'winner', source: 'M98', label: 'W98' } },
  { id: 'M102', round: 4, roundLabel: ROUND_LABELS[4], date: '7月15日', venue: '亚特兰大', team1: { sourceType: 'winner', source: 'M99', label: 'W99' }, team2: { sourceType: 'winner', source: 'M100', label: 'W100' } },
  // Third Place —— M103
  { id: 'M103', round: 5, roundLabel: ROUND_LABELS[5], date: '7月18日', venue: '迈阿密', team1: { sourceType: 'winner', source: 'M101', label: 'L101（负者）' }, team2: { sourceType: 'winner', source: 'M102', label: 'L102（负者）' } },
  // Final —— M104
  { id: 'M104', round: 6, roundLabel: ROUND_LABELS[6], date: '7月19日', venue: '纽约/新泽西（MetLife）', team1: { sourceType: 'winner', source: 'M101', label: 'W101（胜者）' }, team2: { sourceType: 'winner', source: 'M102', label: 'W102（胜者）' } },
];

/** 全部淘汰赛（按轮次排序） */
export const ALL_KNOCKOUT_MATCHES: KnockoutMatch[] = [...R32_MATCHES, ...LATER_MATCHES];

/** 按轮次分组 */
export function getMatchesByRound(): Map<number, KnockoutMatch[]> {
  const map = new Map<number, KnockoutMatch[]>();
  ALL_KNOCKOUT_MATCHES.forEach(m => {
    const arr = map.get(m.round) || [];
    arr.push(m);
    map.set(m.round, arr);
  });
  return map;
}
