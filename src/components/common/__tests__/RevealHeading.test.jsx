import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RevealHeading from '../RevealHeading';

describe('RevealHeading（VFX 光學快門掃光顯影大標）', () => {
  it('應渲染語意化 <h2> 並僅保留一份無障礙可讀標題，同時掛載快門顯影與光刃層', () => {
    render(
      <RevealHeading className="font-display">
        THE MANIFESTO
      </RevealHeading>
    );

    const heading = screen.getByRole('heading', { level: 2, name: 'THE MANIFESTO' });
    expect(heading).toBeInTheDocument();
    expect(screen.getByTestId('reveal-heading-content')).toHaveTextContent('THE MANIFESTO');
    expect(screen.getByTestId('reveal-heading-blade')).toBeInTheDocument();
  });
});
