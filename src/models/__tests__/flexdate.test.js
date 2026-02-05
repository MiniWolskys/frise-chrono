import { describe, it, expect } from 'vitest';
import {
    EMPTY_FLEXDATE,
    isFlexDateValid,
    flexToTimestamp,
    flexCompare,
    flexAfter,
    flexEqual,
    addDurationToFlex,
    computeDurationBetween,
    formatFlexDate,
    formatFlexTickLabel,
    generateFlexTicks,
    daysInMonth,
} from '../flexdate.js';

describe('EMPTY_FLEXDATE', () => {
    it('should have correct default values', () => {
        expect(EMPTY_FLEXDATE.year).toBe("");
        expect(EMPTY_FLEXDATE.month).toBe(1);
        expect(EMPTY_FLEXDATE.day).toBe(1);
        expect(EMPTY_FLEXDATE.precision).toBe("year");
    });
});

describe('isFlexDateValid', () => {
    it('should return true for valid dates', () => {
        expect(isFlexDateValid({ year: 2020, month: 1, day: 1, precision: "year" })).toBe(true);
        expect(isFlexDateValid({ year: 0, month: 1, day: 1, precision: "year" })).toBe(true);
    });

    it('should return false for empty/invalid dates', () => {
        expect(isFlexDateValid(null)).toBe(false);
        expect(isFlexDateValid(undefined)).toBe(false);
        expect(isFlexDateValid({ year: "", month: 1, day: 1, precision: "year" })).toBe(false);
        expect(isFlexDateValid({ year: "-", month: 1, day: 1, precision: "year" })).toBe(false);
        expect(isFlexDateValid({ year: null, month: 1, day: 1, precision: "year" })).toBe(false);
    });

    it('should handle negative years (BC dates)', () => {
        expect(isFlexDateValid({ year: -500, month: 1, day: 1, precision: "year" })).toBe(true);
        expect(isFlexDateValid({ year: -3000, month: 6, day: 15, precision: "day" })).toBe(true);
    });
});

describe('flexToTimestamp', () => {
    it('should convert valid dates to timestamps', () => {
        const ts = flexToTimestamp({ year: 2020, month: 1, day: 1, precision: "year" });
        expect(ts).toBeDefined();
        expect(typeof ts).toBe('number');
    });

    it('should return null for invalid dates', () => {
        expect(flexToTimestamp(null)).toBeNull();
        expect(flexToTimestamp({ year: "", month: 1, day: 1, precision: "year" })).toBeNull();
    });

    it('should handle different precisions', () => {
        const yearOnly = flexToTimestamp({ year: 2020, month: 6, day: 15, precision: "year" });
        const withMonth = flexToTimestamp({ year: 2020, month: 6, day: 15, precision: "month" });
        const withDay = flexToTimestamp({ year: 2020, month: 6, day: 15, precision: "day" });

        expect(yearOnly).not.toEqual(withMonth);
        expect(withMonth).not.toEqual(withDay);
    });
});

describe('flexCompare', () => {
    it('should correctly compare dates', () => {
        const earlier = { year: 2020, month: 1, day: 1, precision: "year" };
        const later = { year: 2021, month: 1, day: 1, precision: "year" };

        expect(flexCompare(earlier, later)).toBeLessThan(0);
        expect(flexCompare(later, earlier)).toBeGreaterThan(0);
        expect(flexCompare(earlier, earlier)).toBe(0);
    });

    it('should return 0 for invalid dates', () => {
        expect(flexCompare(null, { year: 2020, month: 1, day: 1, precision: "year" })).toBe(0);
    });
});

describe('flexAfter', () => {
    it('should return true when first date is after second', () => {
        const earlier = { year: 2020, month: 1, day: 1, precision: "year" };
        const later = { year: 2021, month: 1, day: 1, precision: "year" };

        expect(flexAfter(later, earlier)).toBe(true);
        expect(flexAfter(earlier, later)).toBe(false);
        expect(flexAfter(earlier, earlier)).toBe(false);
    });
});

describe('flexEqual', () => {
    it('should return true for equal dates', () => {
        const date1 = { year: 2020, month: 6, day: 15, precision: "day" };
        const date2 = { year: 2020, month: 6, day: 15, precision: "day" };

        expect(flexEqual(date1, date2)).toBe(true);
    });

    it('should return false for different dates', () => {
        const date1 = { year: 2020, month: 6, day: 15, precision: "day" };
        const date2 = { year: 2020, month: 6, day: 16, precision: "day" };

        expect(flexEqual(date1, date2)).toBe(false);
    });

    it('should return false for invalid dates', () => {
        expect(flexEqual(null, { year: 2020, month: 1, day: 1, precision: "year" })).toBe(false);
    });
});

describe('addDurationToFlex', () => {
    const baseDate = { year: 2020, month: 6, day: 15, precision: "day" };

    it('should add days correctly', () => {
        const result = addDurationToFlex(baseDate, 10, 'days');
        expect(result.year).toBe(2020);
        expect(result.month).toBe(6);
        expect(result.day).toBe(25);
    });

    it('should add months correctly', () => {
        const result = addDurationToFlex(baseDate, 3, 'months');
        expect(result.year).toBe(2020);
        expect(result.month).toBe(9);
    });

    it('should add years correctly', () => {
        const result = addDurationToFlex(baseDate, 5, 'years');
        expect(result.year).toBe(2025);
    });

    it('should add centuries correctly', () => {
        const result = addDurationToFlex(baseDate, 2, 'centuries');
        expect(result.year).toBe(2220);
    });

    it('should handle negative quantities', () => {
        const result = addDurationToFlex(baseDate, -1, 'years');
        expect(result.year).toBe(2019);
    });

    it('should return null for invalid input', () => {
        expect(addDurationToFlex(null, 10, 'days')).toBeNull();
        expect(addDurationToFlex(baseDate, null, 'days')).toBeNull();
    });
});

describe('computeDurationBetween', () => {
    it('should return correct duration for days', () => {
        const start = { year: 2020, month: 1, day: 1, precision: "day" };
        const end = { year: 2020, month: 1, day: 31, precision: "day" };

        const result = computeDurationBetween(start, end);
        expect(result.unit).toBe('days');
        expect(result.qty).toBe(30);
    });

    it('should return correct duration for months', () => {
        const start = { year: 2020, month: 1, day: 1, precision: "month" };
        const end = { year: 2022, month: 1, day: 1, precision: "month" }; // 24 months apart

        const result = computeDurationBetween(start, end);
        expect(result.unit).toBe('months');
        expect(result.qty).toBe(24);
    });

    it('should return correct duration for years', () => {
        const start = { year: 2020, month: 1, day: 1, precision: "year" };
        const end = { year: 2030, month: 1, day: 1, precision: "year" };

        const result = computeDurationBetween(start, end);
        expect(result.unit).toBe('years');
        expect(result.qty).toBe(10);
    });

    it('should return null when end is before start', () => {
        const start = { year: 2020, month: 1, day: 1, precision: "year" };
        const end = { year: 2019, month: 1, day: 1, precision: "year" };

        expect(computeDurationBetween(start, end)).toBeNull();
    });
});

describe('formatFlexDate', () => {
    it('should format year-only dates', () => {
        const date = { year: 2020, month: 1, day: 1, precision: "year" };
        expect(formatFlexDate(date)).toBe('2020');
    });

    it('should format month precision dates', () => {
        const date = { year: 2020, month: 6, day: 1, precision: "month" };
        expect(formatFlexDate(date)).toBe('Juin 2020');
    });

    it('should format full dates', () => {
        const date = { year: 2020, month: 6, day: 15, precision: "day" };
        expect(formatFlexDate(date)).toBe('15 juin 2020');
    });

    it('should handle BC dates (negative years)', () => {
        const date = { year: -500, month: 1, day: 1, precision: "year" };
        expect(formatFlexDate(date)).toBe('500 av. J.-C.');
    });

    it('should return empty string for invalid dates', () => {
        expect(formatFlexDate(null)).toBe('');
        expect(formatFlexDate({ year: "", month: 1, day: 1, precision: "year" })).toBe('');
    });
});

describe('formatFlexTickLabel', () => {
    it('should format tick labels for days', () => {
        const date = { year: 2020, month: 6, day: 15, precision: "day" };
        const label = formatFlexTickLabel(date, 'days');
        expect(label).toContain('15');
        expect(label).toContain('Jui');
    });

    it('should format tick labels for months', () => {
        const date = { year: 2020, month: 6, day: 1, precision: "month" };
        const label = formatFlexTickLabel(date, 'months');
        expect(label).toContain('Jui');
        expect(label).toContain('2020');
    });

    it('should format tick labels for years', () => {
        const date = { year: 2020, month: 1, day: 1, precision: "year" };
        expect(formatFlexTickLabel(date, 'years')).toBe('2020');
    });
});

describe('generateFlexTicks', () => {
    it('should generate correct number of ticks', () => {
        const start = { year: 2020, month: 1, day: 1, precision: "year" };
        const end = { year: 2025, month: 1, day: 1, precision: "year" };

        const ticks = generateFlexTicks(start, end, 1, 'years');
        expect(ticks.length).toBe(6); // 2020, 2021, 2022, 2023, 2024, 2025
    });

    it('should return empty array for invalid input', () => {
        expect(generateFlexTicks(null, null, 1, 'years')).toEqual([]);
    });
});

describe('daysInMonth', () => {
    it('should return correct days for each month', () => {
        expect(daysInMonth(2020, 1)).toBe(31); // January
        expect(daysInMonth(2020, 2)).toBe(29); // February (leap year)
        expect(daysInMonth(2021, 2)).toBe(28); // February (non-leap year)
        expect(daysInMonth(2020, 4)).toBe(30); // April
        expect(daysInMonth(2020, 12)).toBe(31); // December
    });
});
