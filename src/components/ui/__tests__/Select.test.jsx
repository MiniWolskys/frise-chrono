import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select } from '../Select.jsx';

const mockPalette = {
    surface: '#FFFFFF',
    border: '#CCCCCC',
    text: '#333333',
    textLight: '#666666',
};

const mockOptions = [
    { value: 'opt1', label: 'Option 1' },
    { value: 'opt2', label: 'Option 2' },
    { value: 'opt3', label: 'Option 3' },
];

describe('Select', () => {
    it('should render all options', () => {
        render(<Select palette={mockPalette} options={mockOptions} />);

        expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
        expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });

    it('should call onChange when selection changes', () => {
        const handleChange = vi.fn();
        render(<Select palette={mockPalette} options={mockOptions} onChange={handleChange} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'opt2' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('should render with ChevronDown icon', () => {
        render(<Select palette={mockPalette} options={mockOptions} />);
        // The icon is rendered, we can check for SVG presence
        const container = screen.getByRole('combobox').parentElement;
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should have correct value when controlled', () => {
        render(<Select palette={mockPalette} options={mockOptions} value="opt2" onChange={() => {}} />);

        const select = screen.getByRole('combobox');
        expect(select.value).toBe('opt2');
    });
});
