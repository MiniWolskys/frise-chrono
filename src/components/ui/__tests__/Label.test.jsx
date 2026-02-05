import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Label } from '../Label.jsx';

const mockPalette = {
    text: '#333333',
    textMuted: '#999999',
};

describe('Label', () => {
    it('should render children text', () => {
        render(<Label palette={mockPalette}>Test Label</Label>);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render optional sub text', () => {
        render(<Label palette={mockPalette} sub="(optional)">Test Label</Label>);
        expect(screen.getByText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('(optional)')).toBeInTheDocument();
    });

    it('should apply palette text color', () => {
        render(<Label palette={mockPalette}>Test Label</Label>);
        const label = screen.getByText('Test Label');
        expect(label).toHaveStyle({ color: mockPalette.text });
    });

    it('should apply muted color to sub text', () => {
        render(<Label palette={mockPalette} sub="(sub)">Label</Label>);
        const subText = screen.getByText('(sub)');
        expect(subText).toHaveStyle({ color: mockPalette.textMuted });
    });
});
