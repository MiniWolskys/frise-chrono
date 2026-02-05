import { describe, it, expect } from 'vitest';
import { PALETTES } from '../palettes.js';

describe('PALETTES', () => {
    const requiredColorProps = [
        'bg', 'surface', 'surfaceAlt',
        'primary', 'primaryHover',
        'text', 'textLight', 'textMuted',
        'border', 'borderLight',
        'axis', 'tick',
    ];

    it('should have all required palettes', () => {
        expect(Object.keys(PALETTES)).toEqual(['terracotta', 'ocean', 'forest', 'lavande', 'ardoise']);
    });

    Object.entries(PALETTES).forEach(([name, palette]) => {
        describe(`${name} palette`, () => {
            it('should have a valid name and preview color', () => {
                expect(palette.name).toBeDefined();
                expect(typeof palette.name).toBe('string');
                expect(palette.preview).toMatch(/^#[0-9A-Fa-f]{6}$/);
            });

            it('should have all required color properties', () => {
                requiredColorProps.forEach(prop => {
                    expect(palette[prop]).toBeDefined();
                    expect(palette[prop]).toMatch(/^#[0-9A-Fa-f]{6}$/);
                });
            });

            it('should have exactly 6 event colors', () => {
                expect(palette.eventColors).toHaveLength(6);
            });

            it('should have valid hex codes for event colors', () => {
                palette.eventColors.forEach(color => {
                    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
                });
            });
        });
    });
});
