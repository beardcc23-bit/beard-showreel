import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExperienceTimeline from '../ExperienceTimeline';

describe('ExperienceTimeline 元件單元測試', () => {
  it('應該不包含任何多餘的分類大標題', () => {
    render(<ExperienceTimeline />);

    expect(screen.queryByText(/TRACK RECORD/i)).not.toBeInTheDocument();
    expect(screen.queryByText('實戰經歷')).not.toBeInTheDocument();
    expect(screen.queryByText('專業養成')).not.toBeInTheDocument();
  });

  it('應該完整且依序渲染精確的學經歷項目、職稱與年份', () => {
    render(<ExperienceTimeline />);

    // 遇見未來影像創作有限公司 D1特效合成
    expect(screen.getByText('遇見未來影像創作有限公司')).toBeInTheDocument();
    expect(screen.getByText('D1特效合成')).toBeInTheDocument();
    expect(screen.getByText('2012 - 至今')).toBeInTheDocument();

    // 陸軍裝甲第584旅 戰車駕駛兵
    expect(screen.getByText('陸軍裝甲第584旅')).toBeInTheDocument();
    expect(screen.getByText('戰車駕駛兵')).toBeInTheDocument();
    expect(screen.getByText('2011 - 2012')).toBeInTheDocument();

    // 美可特品牌企劃設計 實習
    expect(screen.getByText('美可特品牌企劃設計')).toBeInTheDocument();
    expect(screen.getByText('2011')).toBeInTheDocument();

    // 冉色斯創意影像有限公司 實習
    expect(screen.getByText('冉色斯創意影像有限公司')).toBeInTheDocument();
    expect(screen.getByText('2009')).toBeInTheDocument();

    // 環球科技大學 視覺傳達設計系
    expect(screen.getByText('環球科技大學')).toBeInTheDocument();
    expect(screen.getByText('視覺傳達設計系')).toBeInTheDocument();
    expect(screen.getByText('2007 - 2011')).toBeInTheDocument();

    // 復興商工 廣告設計科 3D動畫組
    expect(screen.getByText('復興商工')).toBeInTheDocument();
    expect(screen.getByText('廣告設計科 3D動畫組')).toBeInTheDocument();
    expect(screen.getByText('2004 - 2007')).toBeInTheDocument();
  });
});
