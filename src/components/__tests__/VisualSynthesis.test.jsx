import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import VisualSynthesis from '../VisualSynthesis';

describe('VisualSynthesis Component', () => {
  it('renders ADVERTISING title without crashing', () => {
    const handlePlayVideo = vi.fn();
    render(<VisualSynthesis onPlayVideo={handlePlayVideo} />);
    
    expect(screen.getByRole('heading', { level: 2, name: /advertising/i })).toBeInTheDocument();
  });
});
