import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ExperienceTimeline from '../ExperienceTimeline';

describe('ExperienceTimeline 元件單元測試', () => {
  it('應該正確渲染實戰經歷與專業養成的分組標題', () => {
    render(<ExperienceTimeline />);

    expect(screen.getByText('實戰經歷')).toBeInTheDocument();
    expect(screen.getByText('專業養成')).toBeInTheDocument();
    expect(screen.getByText(/TRACK RECORD/i)).toBeInTheDocument();
  });

  it('應該完整渲染所有經歷與學歷項目，且去重後的項目完整無缺', () => {
    render(<ExperienceTimeline />);

    // 實戰經歷驗證
    expect(screen.getByText('遇見未來影像創作有限公司')).toBeInTheDocument();
    expect(screen.getByText('2012 - 至今')).toBeInTheDocument();
    expect(screen.getByText('美可特品牌企劃設計')).toBeInTheDocument();
    expect(screen.getByText('陸軍裝甲第584旅')).toBeInTheDocument();
    expect(screen.getByText('冉色斯創意影像有限公司')).toBeInTheDocument();

    // 專業養成驗證
    expect(screen.getByText('環球技術學院')).toBeInTheDocument();
    expect(screen.getByText('復興商工')).toBeInTheDocument();
    expect(screen.getByText(/廣告設計科 3D 動畫組/i)).toBeInTheDocument();
  });
});
