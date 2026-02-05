import { describe, it, expect } from 'vitest';
import {
    PERIOD_UNITS,
    PRECISION_OPTIONS,
    MONTHS_FR,
    CANVAS_PAD,
    TITLE_HEIGHT,
    ROW_HEIGHT,
    BAR_HEIGHT,
    BASE_CANVAS_HEIGHT,
} from '../config.js';

describe('PERIOD_UNITS', () => {
    it('should have correct structure with value and label', () => {
        PERIOD_UNITS.forEach(unit => {
            expect(unit).toHaveProperty('value');
            expect(unit).toHaveProperty('label');
            expect(typeof unit.value).toBe('string');
            expect(typeof unit.label).toBe('string');
        });
    });

    it('should include all expected period units', () => {
        const values = PERIOD_UNITS.map(u => u.value);
        expect(values).toContain('days');
        expect(values).toContain('weeks');
        expect(values).toContain('months');
        expect(values).toContain('years');
        expect(values).toContain('centuries');
        expect(values).toContain('millennia');
    });
});

describe('PRECISION_OPTIONS', () => {
    it('should have correct structure with value and label', () => {
        PRECISION_OPTIONS.forEach(opt => {
            expect(opt).toHaveProperty('value');
            expect(opt).toHaveProperty('label');
        });
    });

    it('should include year, month, and day options', () => {
        const values = PRECISION_OPTIONS.map(o => o.value);
        expect(values).toEqual(['year', 'month', 'day']);
    });
});

describe('MONTHS_FR', () => {
    it('should have 12 months', () => {
        expect(MONTHS_FR).toHaveLength(12);
    });

    it('should have values from 1 to 12', () => {
        MONTHS_FR.forEach((month, idx) => {
            expect(month.value).toBe(idx + 1);
        });
    });

    it('should have French month names', () => {
        expect(MONTHS_FR[0].label).toBe('Janvier');
        expect(MONTHS_FR[6].label).toBe('Juillet');
        expect(MONTHS_FR[11].label).toBe('Décembre');
    });
});

describe('Canvas constants', () => {
    it('CANVAS_PAD should have positive values', () => {
        expect(CANVAS_PAD.left).toBeGreaterThan(0);
        expect(CANVAS_PAD.right).toBeGreaterThan(0);
        expect(CANVAS_PAD.top).toBeGreaterThan(0);
        expect(CANVAS_PAD.bottom).toBeGreaterThan(0);
    });

    it('TITLE_HEIGHT should be positive', () => {
        expect(TITLE_HEIGHT).toBeGreaterThan(0);
    });

    it('ROW_HEIGHT should be positive', () => {
        expect(ROW_HEIGHT).toBeGreaterThan(0);
    });

    it('BAR_HEIGHT should be positive and less than ROW_HEIGHT', () => {
        expect(BAR_HEIGHT).toBeGreaterThan(0);
        expect(BAR_HEIGHT).toBeLessThan(ROW_HEIGHT);
    });

    it('BASE_CANVAS_HEIGHT should be positive', () => {
        expect(BASE_CANVAS_HEIGHT).toBeGreaterThan(0);
    });
});
