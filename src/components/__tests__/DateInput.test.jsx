import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DateInput } from '../DateInput.jsx';

const mockPalette = {
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F5F5',
    border: '#CCCCCC',
    borderLight: '#DDDDDD',
    primary: '#0066CC',
};

describe('DateInput', () => {
    const defaultValue = { year: 2020, month: 6, day: 15, precision: 'year' };

    it('should render precision toggle buttons', () => {
        render(<DateInput palette={mockPalette} value={defaultValue} onChange={() => {}} />);

        expect(screen.getByText('Année')).toBeInTheDocument();
        expect(screen.getByText('Mois')).toBeInTheDocument();
        expect(screen.getByText('Jour')).toBeInTheDocument();
    });

    it('should change precision on toggle click', () => {
        const handleChange = vi.fn();
        render(<DateInput palette={mockPalette} value={defaultValue} onChange={handleChange} />);

        fireEvent.click(screen.getByText('Mois'));
        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ precision: 'month' }));
    });

    it('should show/hide day input based on precision', () => {
        const { rerender } = render(
            <DateInput palette={mockPalette} value={{ ...defaultValue, precision: 'year' }} onChange={() => {}} />
        );

        // Year precision should not show day input
        expect(screen.queryByPlaceholderText('J')).not.toBeInTheDocument();

        // Day precision should show day input
        rerender(
            <DateInput palette={mockPalette} value={{ ...defaultValue, precision: 'day' }} onChange={() => {}} />
        );
        expect(screen.getByPlaceholderText('J')).toBeInTheDocument();
    });

    it('should show/hide month select based on precision', () => {
        const { rerender } = render(
            <DateInput palette={mockPalette} value={{ ...defaultValue, precision: 'year' }} onChange={() => {}} />
        );

        // Year precision should not show month select
        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        // Month precision should show month select
        rerender(
            <DateInput palette={mockPalette} value={{ ...defaultValue, precision: 'month' }} onChange={() => {}} />
        );
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should call onChange with updated FlexDate', () => {
        const handleChange = vi.fn();
        render(
            <DateInput palette={mockPalette} value={{ ...defaultValue, precision: 'month' }} onChange={handleChange} />
        );

        const monthSelect = screen.getByRole('combobox');
        fireEvent.change(monthSelect, { target: { value: '3' } });

        expect(handleChange).toHaveBeenCalledWith(expect.objectContaining({ month: 3 }));
    });

    it('should display BC helper text for negative years', () => {
        render(
            <DateInput palette={mockPalette} value={{ year: -500, month: 1, day: 1, precision: 'year' }} onChange={() => {}} />
        );

        expect(screen.getByText('500 av. J.-C.')).toBeInTheDocument();
    });

    it('should render label when provided', () => {
        render(
            <DateInput palette={mockPalette} value={defaultValue} onChange={() => {}} label="Test Label" />
        );

        expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('should render sub text when provided', () => {
        render(
            <DateInput palette={mockPalette} value={defaultValue} onChange={() => {}} label="Label" sub="(sub)" />
        );

        expect(screen.getByText('(sub)')).toBeInTheDocument();
    });
});
