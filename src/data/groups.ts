/**
 * 2026 世界杯 48 强分组数据
 * 12 组 × 4 队
 */
export interface Team {
  code: string;    // FIFA 国家代码
  name: string;    // 中文名
  flag: string;    // 国旗 emoji
}

export interface Group {
  id: string;      // A-L
  teams: Team[];
}

export const GROUPS: Group[] = [
  {
    id: 'A',
    teams: [
      { code: 'MEX', name: '墨西哥', flag: '🇲🇽' },
      { code: 'RSA', name: '南非', flag: '🇿🇦' },
      { code: 'KOR', name: '韩国', flag: '🇰🇷' },
      { code: 'CZE', name: '捷克', flag: '🇨🇿' },
    ],
  },
  {
    id: 'B',
    teams: [
      { code: 'CAN', name: '加拿大', flag: '🇨🇦' },
      { code: 'BIH', name: '波黑', flag: '🇧🇦' },
      { code: 'QAT', name: '卡塔尔', flag: '🇶🇦' },
      { code: 'SUI', name: '瑞士', flag: '🇨🇭' },
    ],
  },
  {
    id: 'C',
    teams: [
      { code: 'BRA', name: '巴西', flag: '🇧🇷' },
      { code: 'MAR', name: '摩洛哥', flag: '🇲🇦' },
      { code: 'HAI', name: '海地', flag: '🇭🇹' },
      { code: 'SCO', name: '苏格兰', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿' },
    ],
  },
  {
    id: 'D',
    teams: [
      { code: 'USA', name: '美国', flag: '🇺🇸' },
      { code: 'PAR', name: '巴拉圭', flag: '🇵🇾' },
      { code: 'AUS', name: '澳大利亚', flag: '🇦🇺' },
      { code: 'TUR', name: '土耳其', flag: '🇹🇷' },
    ],
  },
  {
    id: 'E',
    teams: [
      { code: 'GER', name: '德国', flag: '🇩🇪' },
      { code: 'CUW', name: '库拉索', flag: '🇨🇼' },
      { code: 'CIV', name: '科特迪瓦', flag: '🇨🇮' },
      { code: 'ECU', name: '厄瓜多尔', flag: '🇪🇨' },
    ],
  },
  {
    id: 'F',
    teams: [
      { code: 'NED', name: '荷兰', flag: '🇳🇱' },
      { code: 'JPN', name: '日本', flag: '🇯🇵' },
      { code: 'SWE', name: '瑞典', flag: '🇸🇪' },
      { code: 'TUN', name: '突尼斯', flag: '🇹🇳' },
    ],
  },
  {
    id: 'G',
    teams: [
      { code: 'BEL', name: '比利时', flag: '🇧🇪' },
      { code: 'EGY', name: '埃及', flag: '🇪🇬' },
      { code: 'IRN', name: '伊朗', flag: '🇮🇷' },
      { code: 'NZL', name: '新西兰', flag: '🇳🇿' },
    ],
  },
  {
    id: 'H',
    teams: [
      { code: 'ESP', name: '西班牙', flag: '🇪🇸' },
      { code: 'CPV', name: '佛得角', flag: '🇨🇻' },
      { code: 'KSA', name: '沙特阿拉伯', flag: '🇸🇦' },
      { code: 'URU', name: '乌拉圭', flag: '🇺🇾' },
    ],
  },
  {
    id: 'I',
    teams: [
      { code: 'FRA', name: '法国', flag: '🇫🇷' },
      { code: 'SEN', name: '塞内加尔', flag: '🇸🇳' },
      { code: 'IRQ', name: '伊拉克', flag: '🇮🇶' },
      { code: 'NOR', name: '挪威', flag: '🇳🇴' },
    ],
  },
  {
    id: 'J',
    teams: [
      { code: 'ARG', name: '阿根廷', flag: '🇦🇷' },
      { code: 'ALG', name: '阿尔及利亚', flag: '🇩🇿' },
      { code: 'AUT', name: '奥地利', flag: '🇦🇹' },
      { code: 'JOR', name: '约旦', flag: '🇯🇴' },
    ],
  },
  {
    id: 'K',
    teams: [
      { code: 'POR', name: '葡萄牙', flag: '🇵🇹' },
      { code: 'COD', name: '民主刚果', flag: '🇨🇩' },
      { code: 'UZB', name: '乌兹别克斯坦', flag: '🇺🇿' },
      { code: 'COL', name: '哥伦比亚', flag: '🇨🇴' },
    ],
  },
  {
    id: 'L',
    teams: [
      { code: 'ENG', name: '英格兰', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
      { code: 'CRO', name: '克罗地亚', flag: '🇭🇷' },
      { code: 'GHA', name: '加纳', flag: '🇬🇭' },
      { code: 'PAN', name: '巴拿马', flag: '🇵🇦' },
    ],
  },
];

/** 排名标签 */
export const RANK_LABELS = ['🥇 第1名', '🥈 第2名', '🥉 第3名', '4️⃣ 第4名'];

/** 最佳小组第三晋级名额（12 组取 8 个） */
export const BEST_THIRD_COUNT = 8;
