/**
 * 學經歷與戰績資料模組 (Experience, Education & Stats Data)
 * 依照倒序時間軸整理，並提供年資自動演進計算
 */

export const CAREER_START_YEAR = 2012;

export function getExperienceYears(now = new Date()) {
  return Math.max(14, now.getFullYear() - CAREER_START_YEAR);
}

export const achievementStats = [
  {
    key: 'years',
    getValue: getExperienceYears,
    unit: 'Years',
    label: '後期資歷',
  },
  {
    key: 'campaigns',
    getValue: () => 300,
    unit: 'Campaigns',
    label: '廣告專案',
  },
  {
    key: 'versions',
    getValue: () => 1000,
    unit: 'Versions',
    label: '播放版本',
  },
];

export const careerHistory = [
  {
    period: '2012 - 至今',
    title: '遇見未來影像創作有限公司',
    role: 'D1特效合成',
    highlight: true
  },
  {
    period: '2011 - 2012',
    title: '陸軍裝甲第584旅',
    role: '戰車駕駛兵'
  },
  {
    period: '2007 - 2011',
    title: '環球科技大學',
    role: '視覺傳達設計系'
  },
  {
    period: '2004 - 2007',
    title: '復興商工',
    role: '廣告設計科 3D動畫組'
  }
];
