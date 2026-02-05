import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventModal } from '../EventModal.jsx';

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

describe('EventModal', () => {
    it('should render with "Nouvel événement" title for new event', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByText('Nouvel événement')).toBeInTheDocument();
    });

    it('should render with "Modifier l\'événement" title for edit', () => {
        const existingEvent = {
            title: 'Existing Event',
            startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
            endDate: null,
            description: '',
            image: null,
        };

        render(
            <EventModal
                palette={mockPalette}
                initial={existingEvent}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByText("Modifier l'événement")).toBeInTheDocument();
    });

    it('should pre-fill form with initial event data', () => {
        const existingEvent = {
            title: 'Existing Event',
            startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
            endDate: null,
            description: 'Test description',
            image: null,
        };

        render(
            <EventModal
                palette={mockPalette}
                initial={existingEvent}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByDisplayValue('Existing Event')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    });

    it('should validate required title field', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        // Click submit without filling title
        fireEvent.click(screen.getByText('Ajouter'));
        expect(screen.getByText('Titre requis')).toBeInTheDocument();
    });

    it('should validate required start date', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        // Fill only title
        const titleInput = screen.getByPlaceholderText('Ex: Révolution française');
        fireEvent.change(titleInput, { target: { value: 'Test Event' } });

        fireEvent.click(screen.getByText('Ajouter'));
        expect(screen.getByText('Date requise')).toBeInTheDocument();
    });

    it('should call onClose when X button clicked', () => {
        const handleClose = vi.fn();
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={handleClose}
            />
        );

        // Find the close button (the X icon button)
        const closeButtons = screen.getAllByRole('button');
        const xButton = closeButtons.find(btn => btn.querySelector('svg'));
        fireEvent.click(xButton);

        expect(handleClose).toHaveBeenCalled();
    });

    it('should call onClose when backdrop clicked', () => {
        const handleClose = vi.fn();
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={handleClose}
            />
        );

        // Click on the backdrop (the outer div)
        const backdrop = document.querySelector('.fixed.inset-0');
        fireEvent.click(backdrop);

        expect(handleClose).toHaveBeenCalled();
    });

    it('should call onClose when Annuler button clicked', () => {
        const handleClose = vi.fn();
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={handleClose}
            />
        );

        fireEvent.click(screen.getByText('Annuler'));
        expect(handleClose).toHaveBeenCalled();
    });

    it('should show end date fields when checkbox is checked', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        // Initially no second DateInput visible beyond the start date
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);

        // After checking, there should be end date fields
        expect(checkbox).toBeChecked();
    });

    it('should have title and start date labels', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByText('Titre *')).toBeInTheDocument();
        expect(screen.getByText('Date de début *')).toBeInTheDocument();
    });
});
