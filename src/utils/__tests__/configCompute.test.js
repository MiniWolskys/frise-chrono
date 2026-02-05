import { describe, it, expect } from 'vitest';
import { autoComputeConfig } from '../configCompute.js';

describe('autoComputeConfig', () => {
    const baseConfig = {
        startDate: { year: "", month: 1, day: 1, precision: "year" },
        endDate: { year: "", month: 1, day: 1, precision: "year" },
        durationQty: "",
        durationUnit: "months",
        periodicityQty: 1,
        periodicityUnit: "years",
        computed: null,
    };

    it('should compute duration when start and end are set', () => {
        const config = {
            ...baseConfig,
            startDate: { year: 2020, month: 1, day: 1, precision: "year" },
            endDate: { year: 2025, month: 1, day: 1, precision: "year" },
        };

        const result = autoComputeConfig(config, 'endDate');
        expect(result.durationQty).toBe(5);
        expect(result.durationUnit).toBe('years');
        expect(result.computed).toBe('duration');
    });

    it('should compute end date when start and duration are set', () => {
        const config = {
            ...baseConfig,
            startDate: { year: 2020, month: 1, day: 1, precision: "year" },
            durationQty: 5,
            durationUnit: "years",
        };

        const result = autoComputeConfig(config, 'durationQty');
        expect(result.endDate.year).toBe(2025);
        expect(result.computed).toBe('end');
    });

    it('should compute start date when end and duration are set', () => {
        const config = {
            ...baseConfig,
            endDate: { year: 2025, month: 1, day: 1, precision: "year" },
            durationQty: 5,
            durationUnit: "years",
        };

        const result = autoComputeConfig(config, 'endDate');
        expect(result.startDate.year).toBe(2020);
        expect(result.computed).toBe('start');
    });

    it('should return unchanged config when insufficient data', () => {
        const result = autoComputeConfig(baseConfig, 'startDate');
        expect(result.computed).toBeNull();
    });
});
