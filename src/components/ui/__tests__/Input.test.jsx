import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../Input.jsx';

const mockPalette = {
    surface: '#FFFFFF',
    surfaceAlt: '#F5F5F5',
    border: '#CCCCCC',
    text: '#333333',
    primary: '#0066CC',
};

describe('Input', () => {
    it('should render with correct placeholder', () => {
        render(<Input palette={mockPalette} placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('should call onChange when value changes', () => {
        const handleChange = vi.fn();
        render(<Input palette={mockPalette} onChange={handleChange} />);

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'test' } });

        expect(handleChange).toHaveBeenCalled();
    });

    it('should apply computed style when computed prop is true', () => {
        render(<Input palette={mockPalette} computed={true} data-testid="input" />);
        const input = screen.getByTestId('input');
        expect(input).toHaveStyle({ background: mockPalette.surfaceAlt });
        expect(input).toHaveStyle({ fontStyle: 'italic' });
    });

    it('should apply normal style when computed prop is false', () => {
        render(<Input palette={mockPalette} computed={false} data-testid="input" />);
        const input = screen.getByTestId('input');
        expect(input).toHaveStyle({ background: mockPalette.surface });
        expect(input).toHaveStyle({ fontStyle: 'normal' });
    });

    it('should change border color on focus', () => {
        render(<Input palette={mockPalette} data-testid="input" />);
        const input = screen.getByTestId('input');

        fireEvent.focus(input);
        // Color is converted to RGB format by the browser
        expect(input.style.borderColor).toBe('rgb(0, 102, 204)');
    });

    it('should change border color on blur', () => {
        render(<Input palette={mockPalette} data-testid="input" />);
        const input = screen.getByTestId('input');

        fireEvent.focus(input);
        fireEvent.blur(input);
        // Color is converted to RGB format by the browser
        expect(input.style.borderColor).toBe('rgb(204, 204, 204)');
    });
});
