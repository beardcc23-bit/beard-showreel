import React from 'react';

/**
 * 手機版專屬：高質感極光金屬漫延流光背景 (獨立隔離組件)
 * 職責單一：專職提供手機端極光動態漸層，不影響任何頁面排版與組件狀態
 */
export const MobileAuroraBackground = React.memo(function MobileAuroraBackground() {
  return (
    <div 
      className="mobile-aurora-mesh pointer-events-none" 
      aria-hidden="true"
    />
  );
});

export default MobileAuroraBackground;
