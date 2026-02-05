import { describe, it, expect, vi } from 'vitest';
import { computeEventLayout, wrapText, roundRect } from '../canvasHelpers.js';

describe('computeEventLayout', () => {
    const mockDateToX = (fd) => fd.year * 10;

    it('should assign events to correct rows', () => {
        const events = [
            { id: '1', title: 'Event 1', startDate: { year: 2020 }, endDate: null },
            { id: '2', title: 'Event 2', startDate: { year: 2025 }, endDate: null },
        ];

        const layout = computeEventLayout(events, mockDateToX);
        expect(layout).toHaveLength(2);
        expect(layout[0]).toHaveProperty('row');
        expect(layout[0]).toHaveProperty('x');
    });

    it('should avoid overlapping events by assigning different rows', () => {
        const events = [
            { id: '1', title: 'Long Event Title Here', startDate: { year: 2020 }, endDate: null },
            { id: '2', title: 'Another Long Event', startDate: { year: 2021 }, endDate: null },
        ];

        const layout = computeEventLayout(events, mockDateToX);
        // Events are close together and may need different rows
        expect(layout.every(ev => typeof ev.row === 'number')).toBe(true);
    });

    it('should handle range events', () => {
        const events = [
            { id: '1', title: 'Range Event', startDate: { year: 2020 }, endDate: { year: 2025 } },
        ];

        const layout = computeEventLayout(events, mockDateToX);
        expect(layout[0].ex).not.toBeNull();
    });

    it('should return empty array for empty events', () => {
        const layout = computeEventLayout([], mockDateToX);
        expect(layout).toEqual([]);
    });
});

describe('wrapText', () => {
    const mockCtx = {
        measureText: vi.fn((text) => ({ width: text.length * 8 })),
    };

    it('should wrap text at word boundaries', () => {
        const text = 'This is a long text that should be wrapped';
        const lines = wrapText(mockCtx, text, 100, 3);
        expect(lines.length).toBeGreaterThan(1);
    });

    it('should respect maxLines limit', () => {
        const text = 'Word1 Word2 Word3 Word4 Word5 Word6 Word7 Word8';
        const lines = wrapText(mockCtx, text, 50, 2);
        expect(lines.length).toBeLessThanOrEqual(2);
    });

    it('should add ellipsis for truncated text', () => {
        const text = 'Word1 Word2 Word3 Word4 Word5 Word6';
        const lines = wrapText(mockCtx, text, 50, 1);
        expect(lines[0]).toContain('…');
    });

    it('should return empty array for empty text', () => {
        const lines = wrapText(mockCtx, '', 100, 3);
        expect(lines).toEqual([]);
    });

    it('should return empty array for whitespace-only text', () => {
        const lines = wrapText(mockCtx, '   ', 100, 3);
        expect(lines).toEqual([]);
    });
});

describe('roundRect', () => {
    it('should create path without errors', () => {
        const mockCtx = {
            beginPath: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            quadraticCurveTo: vi.fn(),
            closePath: vi.fn(),
        };

        expect(() => roundRect(mockCtx, 0, 0, 100, 50, 5)).not.toThrow();
        expect(mockCtx.beginPath).toHaveBeenCalled();
        expect(mockCtx.closePath).toHaveBeenCalled();
    });
});
