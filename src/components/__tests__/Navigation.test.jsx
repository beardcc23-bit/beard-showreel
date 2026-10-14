import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Navigation from '../Navigation';

describe('Navigation 元件行動端對齊與互動測試', () => {
  it('開啟行動端選單後，選單文字與按鈕文字均具有 px-6 對齊樣式', () => {
    render(<Navigation />);

    // 點擊漢堡按鈕開啟行動端側邊選單
    const toggleBtn = screen.getByLabelText('Toggle Navigation Menu');
    fireEvent.click(toggleBtn);

    // 驗證行動端選單項目的類別包含 px-6 (取行動版選單內的元素)
    const profileLinks = screen.getAllByText('個人介紹');
    const mobileProfileLink = profileLinks[profileLinks.length - 1].closest('a');
    expect(mobileProfileLink).toHaveClass('px-6');

    // 驗證下方建立聯繫按鈕亦包含 px-6，文字起點一致
    const contactBtns = screen.getAllByText('建立聯繫');
    const mobileContactBtn = contactBtns[contactBtns.length - 1].closest('a');
    expect(mobileContactBtn).toHaveClass('px-6');
  });
});
