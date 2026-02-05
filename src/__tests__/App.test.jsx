import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TimelineApp from '../App.jsx';

// Mock fonts.ready
beforeEach(() => {
    Object.defineProperty(document, 'fonts', {
        value: {
            ready: Promise.resolve(),
        },
        writable: true,
    });
});

describe('TimelineApp', () => {
    it('should render header with title', () => {
        render(<TimelineApp />);
        expect(screen.getByText(/Frise Chrono/)).toBeInTheDocument();
    });

    it('should render config panel', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Configuration')).toBeInTheDocument();
    });

    it('should show placeholder when config is invalid', () => {
        render(<TimelineApp />);
        expect(screen.getByText(/Renseignez les dates/)).toBeInTheDocument();
    });

    it('should have export buttons', () => {
        render(<TimelineApp />);
        expect(screen.getByText('PNG')).toBeInTheDocument();
        expect(screen.getByText('JPG')).toBeInTheDocument();
    });

    it('should have export buttons disabled when config invalid', () => {
        render(<TimelineApp />);
        const pngButton = screen.getByText('PNG').closest('button');
        const jpgButton = screen.getByText('JPG').closest('button');

        expect(pngButton).toHaveStyle({ opacity: 0.5 });
        expect(jpgButton).toHaveStyle({ opacity: 0.5 });
    });

    it('should render palette selector', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Thème')).toBeInTheDocument();
    });

    it('should render events section', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Événements')).toBeInTheDocument();
    });

    it('should have add event button', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Ajouter')).toBeInTheDocument();
    });

    it('should show empty events message initially', () => {
        render(<TimelineApp />);
        expect(screen.getByText(/Aucun événement/)).toBeInTheDocument();
    });

    it('should open modal when add button clicked with valid config', async () => {
        render(<TimelineApp />);

        // First, set up a valid config
        // Find year inputs and set start and end dates
        const yearInputs = screen.getAllByPlaceholderText('Année');

        // Set start year
        fireEvent.change(yearInputs[0], { target: { value: '2020' } });
        // Set end year
        fireEvent.change(yearInputs[1], { target: { value: '2025' } });

        // Now the Add button should be enabled
        await waitFor(() => {
            const addButton = screen.getByText('Ajouter').closest('button');
            expect(addButton).not.toHaveStyle({ opacity: 0.5 });
        });

        // Click add button
        fireEvent.click(screen.getByText('Ajouter'));

        // Modal should open
        await waitFor(() => {
            expect(screen.getByText('Nouvel événement')).toBeInTheDocument();
        });
    });

    it('should change palette when theme selected', () => {
        render(<TimelineApp />);

        // Find the ocean palette button
        const oceanButton = screen.getByTitle('Océan');
        fireEvent.click(oceanButton);

        // The ocean button should now be scaled (selected)
        expect(oceanButton).toHaveStyle({ transform: 'scale(1.15)' });
    });

    it('should render title input in config panel', () => {
        render(<TimelineApp />);
        expect(screen.getByPlaceholderText('Ma frise chronologique')).toBeInTheDocument();
    });

    it('should render start date input', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Date de début')).toBeInTheDocument();
    });

    it('should render end date input', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Date de fin')).toBeInTheDocument();
    });

    it('should render duration input', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Durée')).toBeInTheDocument();
    });

    it('should render periodicity input', () => {
        render(<TimelineApp />);
        expect(screen.getByText('Périodicité')).toBeInTheDocument();
    });
});
