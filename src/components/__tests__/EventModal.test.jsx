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
    eventColors: ['#FF5733', '#33FF57', '#3357FF', '#F3FF33', '#FF33F3', '#33FFF3'],
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

    it('should render color picker with all palette colors', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        expect(screen.getByText('Couleur')).toBeInTheDocument();
        const colorButtons = screen.getAllByTitle(/Couleur \d/);
        expect(colorButtons).toHaveLength(6);
    });

    it('should use defaultColorIndex for new events', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
                defaultColorIndex={3}
            />
        );

        const colorButtons = screen.getAllByTitle(/Couleur \d/);
        // The 4th button (index 3) should be selected (have scale transform)
        expect(colorButtons[3]).toHaveStyle({ transform: 'scale(1.15)' });
        expect(colorButtons[0]).toHaveStyle({ transform: 'scale(1)' });
    });

    it('should pre-fill colorIndex when editing an event', () => {
        const existingEvent = {
            title: 'Test Event',
            startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
            endDate: null,
            description: '',
            image: null,
            colorIndex: 2,
        };

        render(
            <EventModal
                palette={mockPalette}
                initial={existingEvent}
                onSubmit={() => {}}
                onClose={() => {}}
            />
        );

        const colorButtons = screen.getAllByTitle(/Couleur \d/);
        expect(colorButtons[2]).toHaveStyle({ transform: 'scale(1.15)' });
    });

    it('should change color selection when color button clicked', () => {
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={() => {}}
                onClose={() => {}}
                defaultColorIndex={0}
            />
        );

        const colorButtons = screen.getAllByTitle(/Couleur \d/);
        // Initially first button selected
        expect(colorButtons[0]).toHaveStyle({ transform: 'scale(1.15)' });

        // Click on 3rd color
        fireEvent.click(colorButtons[2]);

        // Now 3rd should be selected
        expect(colorButtons[2]).toHaveStyle({ transform: 'scale(1.15)' });
        expect(colorButtons[0]).toHaveStyle({ transform: 'scale(1)' });
    });

    it('should include colorIndex in submitted data', () => {
        const handleSubmit = vi.fn();
        render(
            <EventModal
                palette={mockPalette}
                onSubmit={handleSubmit}
                onClose={() => {}}
                defaultColorIndex={0}
            />
        );

        // Fill required fields
        const titleInput = screen.getByPlaceholderText('Ex: Révolution française');
        fireEvent.change(titleInput, { target: { value: 'Test Event' } });

        // Set year for start date
        const yearInputs = screen.getAllByPlaceholderText('Année');
        fireEvent.change(yearInputs[0], { target: { value: '2020' } });

        // Select color 4 (index 3)
        const colorButtons = screen.getAllByTitle(/Couleur \d/);
        fireEvent.click(colorButtons[3]);

        // Submit
        fireEvent.click(screen.getByText('Ajouter'));

        expect(handleSubmit).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'Test Event',
                colorIndex: 3,
            })
        );
    });
});
