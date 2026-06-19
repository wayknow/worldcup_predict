import { useState, useMemo } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { GROUPS } from '../../data/groups';
import { ALL_KNOCKOUT_MATCHES, KnockoutMatch, ROUND_LABELS, BracketSlot } from '../../data/knockout';
import {
  getPredictions,
  getKnockoutPredictions,
  saveKnockoutPick,
  clearKnockoutPredictions,
  getThirdSlotAssignments,
  saveThirdSlotAssignment,
  clearThirdSlotAssignments,
  getThirdTeamRanking,
  saveThirdTeamRanking,
  countFirstSecondDone,
  countThirdSelected,
  TOTAL_GROUPS,
  BEST_THIRD_COUNT,
  KnockoutPredictions,
  ThirdSlotAssignments,
} from '../../utils/storage';
import {
  resolveMatchTeams,
  isThirdPlaceSlot,
  getThirdPlaceSlots,
} from '../../utils/resolveTeams';
import './index.scss';

export default function KnockoutPage() {
  const [groupPredictions, setGroupPredictions] = useState(() => getPredictions());
  const [knockoutPicks, setKnockoutPicks] = useState<KnockoutPredictions>(() => getKnockoutPredictions());
  const [thirdSlots, setThirdSlots] = useState<ThirdSlotAssignments>(() => getThirdSlotAssignments());
  const [thirdRanking, setThirdRanking] = useState<string[]>(() => getThirdTeamRanking());
  const [confirmed, setConfirmed] = useState(false);

  useDidShow(() => {
    setGroupPredictions(getPredictions());
    setKnockoutPicks(getKnockoutPredictions());
    setThirdSlots(getThirdSlotAssignments());
    setThirdRanking(getThirdTeamRanking());
  });

  const groupDone = countFirstSecondDone(groupPredictions) === TOTAL_GROUPS
    && countThirdSelected(groupPredictions) === BEST_THIRD_COUNT;

  // 8 支晋级的第3名球队
  const advancingList = useMemo(() => {
    const result: { groupId: string; code: string; flag: string; name: string }[] = [];
    if (!groupDone) return result;
    GROUPS.forEach(g => {
      const pred = groupPredictions[g.id];
      if (pred?.third) {
        const team = g.teams.find(t => t.code === pred.third);
        if (team) result.push({ groupId: g.id, code: team.code, flag: team.flag, name: team.name });
      }
    });
    return result;
  }, [groupPredictions, groupDone]);

  // 排名数组：8 个 team code，index 就是名次（0=#1 ... 7=#8）
  const allCodes = advancingList.map(t => t.code);
  const ranking: string[] = (() => {
    if (allCodes.length !== 8) return [];
    if (thirdRanking.length === 8 && thirdRanking.every(c => allCodes.includes(c))) {
      return thirdRanking;
    }
    return [...advancingList]
      .sort((a, b) => a.groupId.localeCompare(b.groupId))
      .map(t => t.code);
  })();

  // teamCode → 名次（直接查数组，每次都算）
  const rankOf = (code: string) => ranking.indexOf(code);

  const thirdPlaceSlotDefs = getThirdPlaceSlots();

  // ====== 点击名次：数组交换 ======
  const handleRankClick = (teamCode: string, newRank: number) => {
    const oldRank = ranking.indexOf(teamCode);
    if (oldRank === newRank || oldRank < 0) return;

    const next = [...ranking];
    next[oldRank] = next[newRank];
    next[newRank] = teamCode;

    // 排名变了 → 旧的槽位分配失效，先清除（clearThirdSlotAssignments 也会清 ranking，后面重新保存即可）
    if (confirmed) {
      clearThirdSlotAssignments();
      setThirdSlots({});
    }

    // 在清除之后保存新排名，确保不会被覆盖
    saveThirdTeamRanking(next);
    setThirdRanking(next);
    setConfirmed(false);
  };

  // ====== 确认排名 → 填入对阵表 ======
  const handleConfirmRanking = () => {
    thirdPlaceSlotDefs.forEach((def, idx) => {
      if (idx < ranking.length && ranking[idx]) {
        saveThirdSlotAssignment(`${def.matchId}-${def.side}`, ranking[idx]);
      }
    });
    setThirdSlots(getThirdSlotAssignments());
    setConfirmed(true);
    Taro.showToast({ title: '排名已应用到对阵表！', icon: 'success', duration: 1500 });
  };

  // ====== 胜者选择 ======
  const handlePick = (matchId: string, pick: 'team1' | 'team2') => {
    const current = knockoutPicks[matchId];
    const updated = saveKnockoutPick(matchId, current === pick ? null : pick);
    setKnockoutPicks(updated);
  };

  // ====== 快速填充 ======
  const handleQuickFill = () => {
    Taro.showModal({
      title: '快速填充',
      content: '将从 32 强到决赛自动选择左侧队伍胜出。确定？',
      success: (res) => {
        if (res.confirm) {
          ALL_KNOCKOUT_MATCHES.forEach(m => saveKnockoutPick(m.id, 'team1'));
          setKnockoutPicks(getKnockoutPredictions());
          Taro.showToast({ title: '已填充', icon: 'success' });
        }
      },
    });
  };

  // ====== 清除 ======
  const handleClear = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有淘汰赛预测吗？',
      success: (res) => {
        if (res.confirm) {
          clearKnockoutPredictions();
          clearThirdSlotAssignments();
          setKnockoutPicks({});
          setThirdSlots({});
          setConfirmed(false);
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  };

  // ====== 轮次 ======
  const rounds = useMemo(() => {
    const map = new Map<number, KnockoutMatch[]>();
    ALL_KNOCKOUT_MATCHES.forEach(m => {
      const arr = map.get(m.round) || [];
      arr.push(m);
      map.set(m.round, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, []);

  const totalMatches = ALL_KNOCKOUT_MATCHES.length;
  const pickedMatches = Object.values(knockoutPicks).filter(v => v !== null && v !== undefined).length;

  // ====== 渲染一场比赛 ======
  const renderMatch = (match: KnockoutMatch) => {
    const pick = knockoutPicks[match.id] ?? null;
    const { team1, team2 } = resolveMatchTeams(groupPredictions, knockoutPicks, thirdSlots, match);
    const isSpecial = match.round >= 5;

    const renderTeam = (side: 'team1' | 'team2', slot: BracketSlot, resolved: typeof team1) => {
      const isWinner = pick === side;
      return (
        <View
          className={`ko-team ${side} ${isWinner ? 'winner' : ''}`}
          onClick={() => handlePick(match.id, side)}
        >
          <Text className='ko-team-flag'>{resolved.flag || '🏴'}</Text>
          <View className='ko-team-info'>
            <Text className='ko-team-name'>{resolved.name}</Text>
            {resolved.code && <Text className='ko-team-src'>{slot.label}</Text>}
            {!resolved.code && isThirdPlaceSlot(slot) && (
              <Text className='ko-team-src'>(先确认排名)</Text>
            )}
          </View>
          {isWinner && <Text className='ko-win-badge'>✅</Text>}
          {!isWinner && <Text className='ko-tap-hint'>点击选胜者</Text>}
        </View>
      );
    };

    return (
      <View key={match.id} className={`ko-match ${isSpecial ? 'special' : ''} ${pick ? 'picked' : ''}`}>
        <View className='ko-match-header'>
          <Text className='ko-match-id'>{match.id}</Text>
          <Text className='ko-match-venue'>{match.date} · {match.venue}</Text>
        </View>
        {renderTeam('team1', match.team1, team1)}
        <View className='ko-vs'><Text className='ko-vs-text'>VS</Text></View>
        {renderTeam('team2', match.team2, team2)}
      </View>
    );
  };

  // ====== 页面 ======
  return (
    <View className='knockout-page'>
      <View className='ko-header'>
        <Text className='ko-title'>🏆 淘汰赛预测</Text>
        <Text className='ko-subtitle'>32 强 → 决赛，预测每场胜者</Text>
      </View>

      {!groupDone && (
        <View className='ko-warning'>
          <Text className='ko-warn-text'>
            ⚠️ 请先完成小组赛预测（12组第1+第2名，且恰好8个第3名），再进入淘汰赛。
          </Text>
        </View>
      )}

      {/* 最佳第3名排名区 */}
      {groupDone && advancingList.length === 8 && (
        <View className='third-ranking-section'>
          <View className='third-ranking-header'>
            <Text className='third-ranking-title'>🎯 最佳第3名排名（第1好 → 第8好）</Text>
            {confirmed && <Text className='third-ranking-done'>✓ 已应用</Text>}
          </View>
          <Text className='third-ranking-hint'>
            点击圆圈交换名次，两队互换位置
          </Text>

          {advancingList.map(team => {
            const cur = rankOf(team.code);
            return (
              <View key={team.code} className='third-rank-row'>
                <View className='third-rank-team'>
                  <Text className='tr-flag'>{team.flag}</Text>
                  <Text className='tr-name'>{team.name}</Text>
                  <Text className='tr-group'>小组{team.groupId}</Text>
                </View>
                <View className='third-rank-dots'>
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(r => {
                    const sel = cur === r;
                    const taken = !sel && ranking[r] !== undefined && ranking[r] !== team.code;
                    return (
                      <View
                        key={r}
                        className={`tr-dot ${sel ? 'selected' : ''} ${taken ? 'taken' : ''}`}
                        onClick={() => handleRankClick(team.code, r)}
                      >
                        <Text className='tr-dot-icon'>{sel ? '●' : '○'}</Text>
                        <Text className='tr-dot-num'>{r + 1}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <View className='third-confirm-row'>
            {confirmed ? (
              <View className='confirm-done-badge'>
                <Text className='confirm-done-text'>✅ 排名已应用到对阵表</Text>
              </View>
            ) : (
              <View className='confirm-btn ready' onClick={handleConfirmRanking}>
                <Text className='confirm-btn-text'>✅ 确认排名，应用到对阵表</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 进度 */}
      <View className='ko-progress'>
        <Text className='ko-progress-count'>{pickedMatches}/{totalMatches} 场</Text>
        {groupDone && (
          <Text className='ko-progress-label'>（排名{confirmed ? ' ✓' : ' 待确认'}）</Text>
        )}
      </View>

      {groupDone && pickedMatches === 0 && (
        <View className='ko-quickfill' onClick={handleQuickFill}>
          <Text className='ko-quickfill-text'>⚡ 快速填充胜者（全选左队，再逐一调整）</Text>
        </View>
      )}

      {/* 各轮次 */}
      {rounds.map(([round, matches]) => (
        <View key={round} className='ko-round-section'>
          <View className='ko-round-header'>
            <Text className='ko-round-label'>{ROUND_LABELS[round]}</Text>
            <Text className='ko-round-count'>
              {matches.filter(m => knockoutPicks[m.id]).length}/{matches.length}
            </Text>
          </View>
          <View className='ko-match-grid'>
            {matches.map(m => renderMatch(m))}
          </View>
        </View>
      ))}

      {/* 生成预测报告 */}
      {knockoutPicks['M104'] && (
        <View className='ko-report-section'>
          <View
            className='ko-btn-report'
            onClick={() => Taro.navigateTo({ url: '/pages/result/index' })}
          >
            <Text className='ko-btn-report-text'>📋 生成预测报告</Text>
          </View>
        </View>
      )}

      <View className='ko-footer'>
        {pickedMatches > 0 && (
          <View className='ko-btn-clear' onClick={handleClear}>
            <Text className='ko-btn-text'>🗑️ 清除淘汰赛预测</Text>
          </View>
        )}
      </View>

      <View className='bottom-spacer' />
    </View>
  );
}
