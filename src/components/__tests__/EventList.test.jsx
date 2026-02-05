import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventList } from '../EventList.jsx';

const mockPalette = {
    text: '#333333',
    textLight: '#666666',
    textMuted: '#999999',
    surfaceAlt: '#F5F5F5',
    eventColors: ['#FF0000', '#00FF00', '#0000FF'],
};

describe('EventList', () => {
    it('should render empty state message when no events', () => {
        render(
            <EventList
                events={[]}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        expect(screen.getByText(/Aucun événement/)).toBeInTheDocument();
    });

    it('should render all events', () => {
        const events = [
            { id: '1', title: 'Event 1', startDate: { year: 2020, month: 1, day: 1, precision: 'year' } },
            { id: '2', title: 'Event 2', startDate: { year: 2021, month: 1, day: 1, precision: 'year' } },
        ];

        render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        expect(screen.getByText('Event 1')).toBeInTheDocument();
        expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    it('should display event title, date, description', () => {
        const events = [
            {
                id: '1',
                title: 'Test Event',
                startDate: { year: 2020, month: 6, day: 15, precision: 'day' },
                description: 'Test description',
            },
        ];

        render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        expect(screen.getByText('Test Event')).toBeInTheDocument();
        expect(screen.getByText('15 juin 2020')).toBeInTheDocument();
        expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('should display event image when present', () => {
        const events = [
            {
                id: '1',
                title: 'Event with Image',
                startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
                image: 'data:image/png;base64,test',
            },
        ];

        const { container } = render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        const img = container.querySelector('img[src="data:image/png;base64,test"]');
        expect(img).toBeInTheDocument();
    });

    it('should call onEdit when edit button clicked', () => {
        const handleEdit = vi.fn();
        const events = [
            { id: '1', title: 'Event 1', startDate: { year: 2020, month: 1, day: 1, precision: 'year' } },
        ];

        render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={handleEdit}
                onDelete={() => {}}
            />
        );

        // Find the edit button (with Pencil icon)
        const buttons = screen.getAllByRole('button');
        const editButton = buttons[0];
        fireEvent.click(editButton);

        expect(handleEdit).toHaveBeenCalledWith(events[0]);
    });

    it('should call onDelete when delete button clicked', () => {
        const handleDelete = vi.fn();
        const events = [
            { id: '1', title: 'Event 1', startDate: { year: 2020, month: 1, day: 1, precision: 'year' } },
        ];

        render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={handleDelete}
            />
        );

        // Find the delete button (second button)
        const buttons = screen.getAllByRole('button');
        const deleteButton = buttons[1];
        fireEvent.click(deleteButton);

        expect(handleDelete).toHaveBeenCalledWith('1');
    });

    it('should show date range for period events', () => {
        const events = [
            {
                id: '1',
                title: 'Period Event',
                startDate: { year: 2020, month: 1, day: 1, precision: 'year' },
                endDate: { year: 2025, month: 1, day: 1, precision: 'year' },
            },
        ];

        render(
            <EventList
                events={events}
                palette={mockPalette}
                onEdit={() => {}}
                onDelete={() => {}}
            />
        );

        expect(screen.getByText(/2020.*→.*2025/)).toBeInTheDocument();
    });
});
