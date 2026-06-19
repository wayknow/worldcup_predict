import { useState, useMemo } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { GROUPS, Group, Team } from '../../data/groups';
import {
  getPredictions,
  saveGroupPrediction,
  clearAllData,
  countFirstSecondDone,
  countThirdSelected,
  TOTAL_GROUPS,
  BEST_THIRD_COUNT,
  AllPredictions,
  GroupPrediction,
} from '../../utils/storage';
import './index.scss';

export default function IndexPage() {
  const [predictions, setPredictions] = useState<AllPredictions>({});
  const [submitted, setSubmitted] = useState(false);

  useDidShow(() => {
    setPredictions(getPredictions());
  });

  // ====== 统计数据 ======
  const firstSecondDone = useMemo(() => countFirstSecondDone(predictions), [predictions]);
  const thirdCount = useMemo(() => countThirdSelected(predictions), [predictions]);

  const canSubmit = firstSecondDone === TOTAL_GROUPS && thirdCount === BEST_THIRD_COUNT;

  // ====== 获取某组的预测数据 ======
  const getPred = (group: Group): GroupPrediction => {
    return predictions[group.id] ?? { first: null, second: null, third: null };
  };

  // ====== 获取某组按名次排列的队伍列表 ======
  const getOrderedTeams = (group: Group): { team: Team | null; label: string }[] => {
    const pred = getPred(group);
    return [
      { team: group.teams.find(t => t.code === pred.first) ?? null, label: '🥇 第1名' },
      { team: group.teams.find(t => t.code === pred.second) ?? null, label: '🥈 第2名' },
      { team: group.teams.find(t => t.code === pred.third) ?? null, label: '🥉 第3名（晋级）' },
    ];
  };

  // ====== 点击奖牌按钮 ======
  const handleMedalClick = (group: Group, teamCode: string, position: 'first' | 'second' | 'third') => {
    const pred = getPred(group);

    // 点同一个位置 → 取消
    if (pred[position] === teamCode) {
      pred[position] = null;
    } else {
      // 把该队伍从它之前占的任何位置清掉（一队只能占一个名次）
      if (pred.first === teamCode) pred.first = null;
      if (pred.second === teamCode) pred.second = null;
      if (pred.third === teamCode) pred.third = null;

      // 设置新位置
      pred[position] = teamCode;
    }

    const updated = saveGroupPrediction(group.id, pred);
    setPredictions(updated);
  };

  // ====== 提交 ======
  const handleSubmit = () => {
    if (!canSubmit) {
      const issues: string[] = [];
      if (firstSecondDone < TOTAL_GROUPS) {
        issues.push(`还有 ${TOTAL_GROUPS - firstSecondDone} 个小组未选第1和第2名`);
      }
      if (thirdCount !== BEST_THIRD_COUNT) {
        issues.push(`第3名需要恰好选 ${BEST_THIRD_COUNT} 个，当前 ${thirdCount} 个`);
      }
      Taro.showModal({
        title: '预测未完成',
        content: issues.join('\n'),
        showCancel: false,
      });
      return;
    }

    // 列出第3名列表
    const thirdTeams = GROUPS
      .filter(g => getPred(g).third)
      .map(g => {
        const t = g.teams.find(t => t.code === getPred(g).third);
        return `小组 ${g.id}：${t?.flag ?? ''} ${t?.name ?? ''}`;
      });

    Taro.showModal({
      title: '确认提交',
      content: `12 组第1+第2名已完成 ✓\n第3名晋级：${thirdCount}/${BEST_THIRD_COUNT}\n\n${thirdTeams.join('\n')}\n\n提交后不可修改，确认？`,
      success: (res) => {
        if (res.confirm) {
          setSubmitted(true);
          Taro.showToast({ title: '预测已提交！🎉', icon: 'success', duration: 2000 });
        }
      },
    });
  };

  // ====== 清除 ======
  const handleClear = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除所有预测数据吗？',
      success: (res) => {
        if (res.confirm) {
          clearAllData();
          setPredictions({});
          setSubmitted(false);
          Taro.showToast({ title: '已清除', icon: 'success' });
        }
      },
    });
  };

  const handleReset = () => {
    Taro.showModal({
      title: '重新预测',
      content: '确定要清除并重新开始吗？',
      success: (res) => {
        if (res.confirm) {
          clearAllData();
          setPredictions({});
          setSubmitted(false);
        }
      },
    });
  };

  // ====== 渲染 ======
  return (
    <View className='index-page'>
      {/* 顶部标题 */}
      <View className='header'>
        <Text className='header-title'>🏆 世界杯 2026</Text>
        <Text className='header-subtitle'>小组赛 · 淘汰赛 · 全程预测</Text>
      </View>

      {/* 已提交横幅 */}
      {submitted && (
        <View className='submitted-banner'>
          <Text className='banner-text'>✅ 预测已提交，祝你好运！</Text>
        </View>
      )}

      {/* 计数器 */}
      <View className='stats-row'>
        <View className='stat-box'>
          <Text className='stat-label'>第1+第2名</Text>
          <Text className={`stat-value ${firstSecondDone === TOTAL_GROUPS ? 'done' : ''}`}>
            {firstSecondDone} / {TOTAL_GROUPS}
          </Text>
          {firstSecondDone < TOTAL_GROUPS && (
            <Text className='stat-hint'>还需 {TOTAL_GROUPS - firstSecondDone} 组</Text>
          )}
        </View>
        <View className='stat-box'>
          <Text className='stat-label'>第3名晋级</Text>
          <Text className={`stat-value ${thirdCount === BEST_THIRD_COUNT ? 'done' : ''}`}>
            {thirdCount} / {BEST_THIRD_COUNT}
          </Text>
          {thirdCount < BEST_THIRD_COUNT && (
            <Text className='stat-hint'>还需 {BEST_THIRD_COUNT - thirdCount} 个</Text>
          )}
          {thirdCount > BEST_THIRD_COUNT && (
            <Text className='stat-hint warn'>多了 {thirdCount - BEST_THIRD_COUNT} 个</Text>
          )}
        </View>
      </View>

      {/* 规则 */}
      <View className='rule-hint'>
        <Text className='rule-text'>
          🥇🥈 <Text className='highlight'>必选</Text>（每组都要选） ｜ 🥉{' '}
          <Text className='highlight'>可选</Text>（12 组中选 8 个最佳第3名晋级）
        </Text>
      </View>

      {/* 小组列表 */}
      <View className='group-list'>
        {GROUPS.map(group => {
          const pred = getPred(group);
          const hasBoth = !!(pred.first && pred.second);
          const ordered = getOrderedTeams(group);

          // 哪些名次已被占（用于灰掉其他队伍的按钮）
          const hasFirst = !!pred.first;
          const hasSecond = !!pred.second;
          const hasThird = !!pred.third;

          return (
            <View key={group.id} className={`group-card ${hasBoth ? 'done' : ''}`}>
              {/* 组标题 */}
              <View className='group-title-bar'>
                <Text className='group-label'>小组 {group.id}</Text>
                <Text className={`group-status ${hasBoth ? 'ok' : 'todo'}`}>
                  {hasBoth ? '✓' : '待选'}
                </Text>
              </View>

              {/* 已选结果摘要 */}
              {hasBoth && (
                <View className='result-strip'>
                  {ordered.map((item, idx) => (
                    <View key={idx} className='result-slot'>
                      <Text className='result-place'>
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                      </Text>
                      {item.team ? (
                        <>
                          <Text className='result-flag'>{item.team.flag}</Text>
                          <Text className='result-name'>{item.team.name}</Text>
                        </>
                      ) : (
                        <Text className='result-empty'>—</Text>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* 队伍选择区 */}
              {!submitted && (
                <View className='team-select-area'>
                  {group.teams.map(team => {
                    const isFirst = pred.first === team.code;
                    const isSecond = pred.second === team.code;
                    const isThird = pred.third === team.code;

                    return (
                      <View key={team.code} className='team-row'>
                        <View className='team-identity'>
                          <Text className='team-flag'>{team.flag}</Text>
                          <Text className='team-name'>{team.name}</Text>
                        </View>
                        <View className='medal-btns'>
                          <View
                            className={`medal-btn first ${isFirst ? 'active' : ''} ${hasFirst && !isFirst ? 'dimmed' : ''}`}
                            onClick={() => handleMedalClick(group, team.code, 'first')}
                          >
                            <Text className='medal-icon'>🥇</Text>
                            <Text className='medal-text'>第1</Text>
                          </View>
                          <View
                            className={`medal-btn second ${isSecond ? 'active' : ''} ${hasSecond && !isSecond ? 'dimmed' : ''}`}
                            onClick={() => handleMedalClick(group, team.code, 'second')}
                          >
                            <Text className='medal-icon'>🥈</Text>
                            <Text className='medal-text'>第2</Text>
                          </View>
                          <View
                            className={`medal-btn third ${isThird ? 'active' : ''} ${hasThird && !isThird ? 'dimmed' : ''}`}
                            onClick={() => handleMedalClick(group, team.code, 'third')}
                          >
                            <Text className='medal-icon'>🥉</Text>
                            <Text className='medal-text'>第3</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* 提交按钮 */}
      {!submitted && (
        <View className='submit-section'>
          <View
            className={`submit-btn ${canSubmit ? 'ready' : ''}`}
            onClick={handleSubmit}
          >
            <Text className='submit-text'>
              {canSubmit ? '✅ 提交预测' : '📋 提交预测'}
            </Text>
          </View>
          <Text className='submit-condition'>
            {firstSecondDone < TOTAL_GROUPS
              ? `还需完成 ${TOTAL_GROUPS - firstSecondDone} 组第1+第2名`
              : thirdCount < BEST_THIRD_COUNT
                ? `还需选 ${BEST_THIRD_COUNT - thirdCount} 个第3名`
                : thirdCount > BEST_THIRD_COUNT
                  ? `第3名多选了 ${thirdCount - BEST_THIRD_COUNT} 个`
                  : '全部就绪，可以提交！'}
          </Text>
        </View>
      )}

      {/* 淘汰赛入口 */}
      <View className='knockout-entry'>
        <View
          className={`ko-nav-btn ${!canSubmit ? 'disabled' : ''}`}
          onClick={() => {
            if (!canSubmit) {
              const msg = thirdCount !== BEST_THIRD_COUNT
                ? `第3名需要恰好选 ${BEST_THIRD_COUNT} 个，当前选了 ${thirdCount} 个`
                : `请先完成全部 ${TOTAL_GROUPS} 组第1+第2名的选择`;
              Taro.showToast({ title: msg, icon: 'none', duration: 2000 });
              return;
            }
            Taro.navigateTo({ url: '/pages/knockout/index' });
          }}
        >
          <Text className='ko-nav-text'>🏆 进入淘汰赛预测 →</Text>
        </View>
      </View>

      {/* 底部操作 */}
      <View className='footer-actions'>
        {!submitted && (
          <View className='btn-clear' onClick={handleClear}>
            <Text className='btn-text'>🗑️ 清除全部</Text>
          </View>
        )}
        {submitted && (
          <View className='btn-reset' onClick={handleReset}>
            <Text className='btn-text'>🔄 重新预测</Text>
          </View>
        )}
      </View>

      <View className='bottom-spacer' />
    </View>
  );
}
