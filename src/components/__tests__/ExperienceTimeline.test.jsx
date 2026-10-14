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
    expect(screen.queryByText(/EXPERIENCE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/EDUCATION/i)).not.toBeInTheDocument();
  });

  it('應該完整渲染單一整合時間軸中的 6 個學經歷項目與修正後的年份', () => {
    render(<ExperienceTimeline />);

    // 項目與職務/實習驗證
    expect(screen.getByText('遇見未來影像創作有限公司')).toBeInTheDocument();
    expect(screen.getByText('2012 - 至今')).toBeInTheDocument();

    expect(screen.getByText('陸軍裝甲第584旅')).toBeInTheDocument();
    expect(screen.getByText('戰車駕駛兵')).toBeInTheDocument();
    expect(screen.getByText('2011 - 2012')).toBeInTheDocument();

    expect(screen.getByText('美可特品牌企劃設計')).toBeInTheDocument();
    expect(screen.getByText('2011')).toBeInTheDocument();

    expect(screen.getByText('環球技術學院')).toBeInTheDocument();
    expect(screen.getByText('視覺傳達設計系')).toBeInTheDocument();
    expect(screen.getByText('2007 - 2011')).toBeInTheDocument();

    expect(screen.getByText('冉色斯創意影像有限公司')).toBeInTheDocument();
    expect(screen.getByText('2009')).toBeInTheDocument();

    expect(screen.getByText('復興商工')).toBeInTheDocument();
    expect(screen.getByText('廣告設計科 3D動畫組')).toBeInTheDocument();
    expect(screen.getByText('2004 - 2007')).toBeInTheDocument();
  });
});
