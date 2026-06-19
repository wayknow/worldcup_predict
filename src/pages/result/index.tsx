import { useState, useEffect } from 'react';
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { GROUPS } from '../../data/groups';
import { ALL_KNOCKOUT_MATCHES, ROUND_LABELS } from '../../data/knockout';
import {
  getPredictions,
  getKnockoutPredictions,
  getThirdSlotAssignments,
  getThirdTeamRanking,
  getUserInfo,
  getReportTime,
  saveReportTime,
  clearAllData,
} from '../../utils/storage';
import { resolveMatchTeams } from '../../utils/resolveTeams';
import { requestUserInfo, formatReportTime } from '../../utils/user';
import './index.scss';

export default function ResultPage() {
  const [nickname, setNickname] = useState('球迷');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [reportTime, setReportTimeState] = useState('');
  const [ready, setReady] = useState(false);

  // 聚合所有数据
  const predictions = getPredictions();
  const knockoutPicks = getKnockoutPredictions();
  const thirdSlots = getThirdSlotAssignments();
  const thirdRanking = getThirdTeamRanking();

  useEffect(() => {
    // 检查数据完整性
    if (Object.keys(predictions).length === 0) {
      Taro.showToast({ title: '请先完成小组赛预测', icon: 'none' });
      setTimeout(() => Taro.navigateBack(), 1200);
      return;
    }

    // 加载用户信息
    const user = getUserInfo();
    if (user) {
      setNickname(user.nickname);
      setAvatarUrl(user.avatarUrl);
    }

    // 加载/生成时间戳
    const savedTime = getReportTime();
    if (savedTime) {
      setReportTimeState(savedTime);
    } else {
      const now = formatReportTime(new Date());
      saveReportTime(now);
      setReportTimeState(now);
    }

    setReady(true);
  }, []);

  // ====== 分享配置 ======
  useShareAppMessage(() => ({
    title: `${nickname}的2026世界杯预测报告`,
    path: '/pages/index/index',
    imageUrl: '',
  }));

  useShareTimeline(() => ({
    title: '来看看我的2026世界杯预测！🏆',
  }));

  // ====== 获取用户信息 ======
  const handleRequestUser = async () => {
    const user = await requestUserInfo();
    if (user) {
      setNickname(user.nickname);
      setAvatarUrl(user.avatarUrl);
    }
  };

  // ====== 截图提示 ======
  const handleScreenshot = () => {
    Taro.showModal({
      title: '保存截图',
      content: '请使用手机截图功能保存当前页面，或长按页面截图。',
      showCancel: false,
    });
  };

  // ====== 分享到朋友圈 ======
  const handleShareTimeline = () => {
    if (process.env.TARO_ENV !== 'weapp') {
      Taro.showToast({ title: '微信小程序环境支持，请截图分享', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '点击右上角 ··· 分享到朋友圈', icon: 'none', duration: 2000 });
  };

  // ====== 分享给朋友 ======
  const handleShareFriend = () => {
    if (process.env.TARO_ENV !== 'weapp') {
      Taro.showToast({ title: '微信小程序环境支持，请截图分享', icon: 'none' });
      return;
    }
    Taro.showToast({ title: '点击右上角 ··· 分享给朋友', icon: 'none', duration: 2000 });
  };

  // ====== 重新预测 ======
  const handleReset = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有预测数据，重新开始吗？',
      success: (res) => {
        if (res.confirm) {
          clearAllData();
          Taro.reLaunch({ url: '/pages/index/index' });
        }
      },
    });
  };

  if (!ready) {
    return <View className='result-page'><Text className='result-title' style={{ textAlign: 'center', paddingTop: '200px', color: '#888' }}>加载中...</Text></View>;
  }

  // ====== 小组赛数据 ======
  const groupsData = GROUPS.map(g => {
    const pred = predictions[g.id];
    return {
      id: g.id,
      teams: g.teams,
      first: pred?.first ? g.teams.find(t => t.code === pred.first) : null,
      second: pred?.second ? g.teams.find(t => t.code === pred.second) : null,
      third: pred?.third ? g.teams.find(t => t.code === pred.third) : null,
    };
  });

  // ====== 最佳第3名数据 ======
  const thirdRankData = thirdRanking
    .map(code => {
      for (const g of GROUPS) {
        const t = g.teams.find(t => t.code === code);
        if (t) return t;
      }
      return null;
    })
    .filter(Boolean);

  // ====== 淘汰赛轮次 ======
  const rounds = (() => {
    const map = new Map<number, typeof ALL_KNOCKOUT_MATCHES>();
    ALL_KNOCKOUT_MATCHES.forEach(m => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  })();

  const renderMatch = (match: typeof ALL_KNOCKOUT_MATCHES[0]) => {
    const pick = knockoutPicks[match.id] ?? null;
    const { team1, team2 } = resolveMatchTeams(predictions, knockoutPicks, thirdSlots, match);
    const isFinal = match.round >= 5;

    const renderTeam = (side: 'team1' | 'team2', resolved: typeof team1) => {
      const isWinner = pick === side;
      return (
        <View className={`ko-result-team ${isWinner ? 'winner' : (pick && !isWinner ? 'loser' : '')}`}>
          <Text className='ko-result-flag'>{resolved.flag || '🏴'}</Text>
          <Text className='ko-result-name'>{resolved.name}</Text>
          {isWinner && <Text className='ko-result-win-badge'>✅</Text>}
        </View>
      );
    };

    return (
      <View key={match.id} className={`ko-result-match ${isFinal ? 'final-match' : ''}`}>
        {renderTeam('team1', team1)}
        <Text className='ko-result-vs'>VS</Text>
        {renderTeam('team2', team2)}
      </View>
    );
  };

  return (
    <View className='result-page'>
      {/* Header */}
      <View className='result-header'>
        <Text className='result-title'>🏆 2026世界杯预测报告</Text>
        <View className='result-user'>
          <View className='result-avatar'>
            {avatarUrl ? (
              <Image className='result-avatar-img' src={avatarUrl} />
            ) : (
              <Text>⚽</Text>
            )}
          </View>
          <Text className='result-nickname'>{nickname}</Text>
          <Text className='result-edit-name' onClick={handleRequestUser}>
            {avatarUrl || nickname === '匿名球迷' ? '✏️ 设置' : ''}
          </Text>
        </View>
        <Text className='result-time'>{reportTime}</Text>
      </View>

      {/* 小组赛结果 */}
      <View className='result-section'>
        <View className='section-header'>
          <Text className='section-icon'>📊</Text>
          <Text className='section-title'>小组赛排名</Text>
          <Text className='section-count'>12 组</Text>
        </View>
        <View className='group-grid'>
          {groupsData.map(g => (
            <View key={g.id} className='group-card'>
              <Text className='group-card-label'>小组 {g.id}</Text>
              {[g.first, g.second, g.third].map((team, idx) => (
                <View key={idx} className='group-rank-row'>
                  <Text className='group-rank-badge'>{['🥇', '🥈', '🥉'][idx]}</Text>
                  {team ? (
                    <>
                      <Text className='group-rank-flag'>{team.flag}</Text>
                      <Text className='group-rank-name'>{team.name}</Text>
                    </>
                  ) : (
                    <Text className='group-rank-empty'>未预测</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>

      {/* 最佳第3名排名 */}
      {thirdRankData.length === 8 && (
        <View className='result-section'>
          <View className='section-header'>
            <Text className='section-icon'>🎯</Text>
            <Text className='section-title'>最佳第3名排名</Text>
          </View>
          <View className='third-rank-list'>
            {thirdRankData.map((team, idx) => (
              team && (
                <View key={idx} className='third-rank-chip'>
                  <Text className='third-rank-num'>#{idx + 1}</Text>
                  <Text className='third-rank-flag'>{team.flag}</Text>
                  <Text className='third-rank-name'>{team.name}</Text>
                </View>
              )
            ))}
          </View>
        </View>
      )}

      {/* 淘汰赛对阵 */}
      <View className='result-section'>
        <View className='section-header'>
          <Text className='section-icon'>⚔️</Text>
          <Text className='section-title'>淘汰赛对阵</Text>
          <Text className='section-count'>
            {Object.values(knockoutPicks).filter(v => v).length}/{ALL_KNOCKOUT_MATCHES.length} 场
          </Text>
        </View>
        {rounds.map(([round, matches]) => (
          <View key={round} className='ko-round-block'>
            <Text className='ko-round-label'>{ROUND_LABELS[round]}</Text>
            <View className='ko-result-grid'>
              {matches.map(m => renderMatch(m))}
            </View>
          </View>
        ))}
      </View>

      {/* 操作按钮 */}
      <View className='result-actions'>
        <View className='result-btn btn-share' onClick={handleShareFriend}>
          <Text>📤</Text><Text>分享给朋友</Text>
        </View>
        <View className='result-btn btn-timeline' onClick={handleShareTimeline}>
          <Text>🔄</Text><Text>分享到朋友圈</Text>
        </View>
        <View className='result-btn btn-screenshot' onClick={handleScreenshot}>
          <Text>📸</Text><Text>保存截图</Text>
        </View>
        <View className='result-btn btn-reset' onClick={handleReset}>
          <Text>🗑️</Text><Text>清除所有预测，重新开始</Text>
        </View>
        {process.env.TARO_ENV !== 'weapp' && (
          <Text className='btn-hint'>💡 分享功能在微信小程序中可用，当前请使用截图保存</Text>
        )}
      </View>

      <View className='result-bottom-spacer' />
    </View>
  );
}
