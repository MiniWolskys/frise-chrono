import { PRECISION_OPTIONS, MONTHS_FR } from '../constants/config.js';
import { EMPTY_FLEXDATE, daysInMonth } from '../models/flexdate.js';
import { Label, Input, Select } from './ui/index.js';

export function DateInput({ value, onChange, palette, computed = false, label, sub }) {
    const fd = value || EMPTY_FLEXDATE;

    const update = (field, val) => {
        const next = { ...fd, [field]: val };
        if (field === "precision") {
            if (val === "year") { next.month = 1; next.day = 1; }
            if (val === "month") { next.day = 1; }
        }
        // Clamp day to valid range for given month/year
        if ((field === "day" || field === "month" || field === "year") && next.precision === "day") {
            const year = Number(field === "year" ? val : next.year);
            const month = Number(field === "month" ? val : next.month);
            if (year && month) {
                const maxDay = daysInMonth(year, month);
                if (next.day > maxDay) next.day = maxDay;
            }
        }
        onChange(next);
    };

    const yearStr = fd.year === 0 || fd.year ? String(fd.year) : "";

    return (
        <div>
            {label && <Label palette={palette} sub={sub}>{label}</Label>}

            {/* Precision toggle */}
            <div className="flex rounded-lg overflow-hidden mb-2" style={{ border: `1.5px solid ${palette.borderLight}` }}>
                {PRECISION_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        onClick={() => update("precision", opt.value)}
                        className="flex-1 py-1 text-xs font-medium cursor-pointer transition-all"
                        style={{
                            background: fd.precision === opt.value ? palette.primary : "transparent",
                            color: fd.precision === opt.value ? "#fff" : palette.textLight,
                        }}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* Adaptive fields */}
            <div className="flex gap-2">
                {fd.precision === "day" && (
                    <Input
                        type="number"
                        palette={palette}
                        computed={computed}
                        className="text-center"
                        style={{ width: "4rem", flexShrink: 0 }}
                        placeholder="J"
                        min={1}
                        max={fd.year && fd.month ? daysInMonth(Number(fd.year), Number(fd.month)) : 31}
                        value={fd.day || ""}
                        onChange={(e) => update("day", parseInt(e.target.value, 10) || "")}
                    />
                )}
                {(fd.precision === "month" || fd.precision === "day") && (
                    <Select
                        palette={palette}
                        className="flex-1 min-w-0"
                        value={fd.month || 1}
                        onChange={(e) => update("month", parseInt(e.target.value, 10))}
                        options={MONTHS_FR}
                    />
                )}
                <Input
                    type="number"
                    palette={palette}
                    computed={computed}
                    className={fd.precision === "year" ? "flex-1" : ""}
                    style={fd.precision !== "year" ? { width: "6rem", flexShrink: 0 } : undefined}
                    placeholder="Année"
                    value={yearStr}
                    onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "" || raw === "-") { update("year", raw); return; }
                        const n = parseInt(raw, 10);
                        if (!isNaN(n)) update("year", n);
                    }}
                />
            </div>

            {/* BC helper text */}
            {yearStr && Number(yearStr) < 0 && (
                <p style={{ color: palette.textMuted }} className="text-xs mt-1 italic">
                    {Math.abs(Number(yearStr))} av. J.-C.
                </p>
            )}
        </div>
    );
}
