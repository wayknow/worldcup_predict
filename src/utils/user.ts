import Taro from '@tarojs/taro';
import { getUserInfo, saveUserInfo, UserInfo } from './storage';

const DEFAULT_NICKNAME = '球迷';

/**
 * 检查用户信息是否已存在
 */
export function hasUserInfo(): boolean {
  const cached = getUserInfo();
  return cached !== null && cached.nickname !== DEFAULT_NICKNAME;
}

/**
 * 微信小程序：通过 getUserProfile 弹窗获取昵称和头像
 */
function getWeappUserProfile(): Promise<UserInfo | null> {
  return new Promise((resolve) => {
    try {
      // @ts-ignore - getUserProfile 可能在部分 Taro 版本中未声明
      const getUserProfile = Taro.getUserProfile;
      if (typeof getUserProfile !== 'function') {
        resolve(null);
        return;
      }
      getUserProfile({
        desc: '用于生成预测报告',
        success: (res: any) => {
          const info: UserInfo = {
            nickname: res.userInfo?.nickName || DEFAULT_NICKNAME,
            avatarUrl: res.userInfo?.avatarUrl || '',
          };
          saveUserInfo(info);
          resolve(info);
        },
        fail: () => resolve(null),
      });
    } catch {
      resolve(null);
    }
  });
}

/**
 * 通用昵称输入弹窗（H5 和微信降级方案）
 */
function promptNickname(): Promise<string> {
  return new Promise((resolve) => {
    Taro.showModal({
      title: '设置昵称',
      content: '请输入你的昵称，用于生成预测报告',
      editable: true,
      placeholderText: DEFAULT_NICKNAME,
      success: (res) => {
        if (res.confirm && res.content) {
          resolve(res.content.trim() || DEFAULT_NICKNAME);
        } else {
          resolve(DEFAULT_NICKNAME);
        }
      },
      fail: () => resolve(DEFAULT_NICKNAME),
    });
  });
}

/**
 * 获取或请求用户信息
 * 优先级：缓存 > 微信授权 > 手动输入
 */
export async function requestUserInfo(): Promise<UserInfo> {
  const cached = getUserInfo();
  if (cached) return cached;

  // 微信环境尝试 getUserProfile
  if (process.env.TARO_ENV === 'weapp') {
    const wxResult = await getWeappUserProfile();
    if (wxResult) return wxResult;
  }

  // 降级：手动输入昵称
  const nickname = await promptNickname();
  const info: UserInfo = { nickname, avatarUrl: '' };
  saveUserInfo(info);
  return info;
}

/** 格式化报告时间 */
export function formatReportTime(date: Date): string {
  const y = date.getFullYear();
  const M = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${y}年${M}月${d}日 ${h}:${m}`;
}
