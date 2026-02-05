import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfigPanel } from '../ConfigPanel.jsx';

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

const defaultConfig = {
    startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
    endDate: { year: 2025, month: 1, day: 1, precision: 'year' },
    durationQty: '5',
    durationUnit: 'years',
    periodicityQty: 1,
    periodicityUnit: 'years',
    computed: null,
};

describe('ConfigPanel', () => {
    it('should render title input', () => {
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByPlaceholderText('Ma frise chronologique')).toBeInTheDocument();
    });

    it('should render start/end date inputs', () => {
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByText('Date de début')).toBeInTheDocument();
        expect(screen.getByText('Date de fin')).toBeInTheDocument();
    });

    it('should render duration inputs', () => {
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should render periodicity inputs', () => {
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByText('Périodicité')).toBeInTheDocument();
    });

    it('should call onTitleChange when title changes', () => {
        const handleTitleChange = vi.fn();
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={handleTitleChange}
            />
        );

        const titleInput = screen.getByPlaceholderText('Ma frise chronologique');
        fireEvent.change(titleInput, { target: { value: 'New Title' } });

        expect(handleTitleChange).toHaveBeenCalledWith('New Title');
    });

    it('should show computed indicator for start date', () => {
        render(
            <ConfigPanel
                config={{ ...defaultConfig, computed: 'start' }}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByText('(calculé)')).toBeInTheDocument();
    });

    it('should show Configuration header', () => {
        render(
            <ConfigPanel
                config={defaultConfig}
                onChange={() => {}}
                palette={mockPalette}
                title=""
                onTitleChange={() => {}}
            />
        );

        expect(screen.getByText('Configuration')).toBeInTheDocument();
    });
});
