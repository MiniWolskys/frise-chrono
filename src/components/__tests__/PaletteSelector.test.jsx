import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PaletteSelector } from '../PaletteSelector.jsx';

const mockPalette = {
    textLight: '#666666',
    surface: '#FFFFFF',
};

describe('PaletteSelector', () => {
    it('should render all palette buttons', () => {
        render(
            <PaletteSelector
                current="terracotta"
                onChange={() => {}}
                palette={mockPalette}
            />
        );

        // Should have 5 palette buttons
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(5);
    });

    it('should highlight current palette', () => {
        render(
            <PaletteSelector
                current="ocean"
                onChange={() => {}}
                palette={mockPalette}
            />
        );

        // The ocean button should be scaled
        const buttons = screen.getAllByRole('button');
        const oceanButton = buttons.find(btn => btn.title === 'Océan');
        expect(oceanButton).toHaveStyle({ transform: 'scale(1.15)' });
    });

    it('should call onChange with palette key when clicked', () => {
        const handleChange = vi.fn();
        render(
            <PaletteSelector
                current="terracotta"
                onChange={handleChange}
                palette={mockPalette}
            />
        );

        // Click on the ocean palette (second button)
        const buttons = screen.getAllByRole('button');
        const oceanButton = buttons.find(btn => btn.title === 'Océan');
        fireEvent.click(oceanButton);

        expect(handleChange).toHaveBeenCalledWith('ocean');
    });

    it('should display theme label', () => {
        render(
            <PaletteSelector
                current="terracotta"
                onChange={() => {}}
                palette={mockPalette}
            />
        );

        expect(screen.getByText('Thème')).toBeInTheDocument();
    });

    it('should have title attributes on palette buttons', () => {
        render(
            <PaletteSelector
                current="terracotta"
                onChange={() => {}}
                palette={mockPalette}
            />
        );

        expect(screen.getByTitle('Terracotta')).toBeInTheDocument();
        expect(screen.getByTitle('Océan')).toBeInTheDocument();
        expect(screen.getByTitle('Forêt')).toBeInTheDocument();
        expect(screen.getByTitle('Lavande')).toBeInTheDocument();
        expect(screen.getByTitle('Ardoise')).toBeInTheDocument();
    });
});
