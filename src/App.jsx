import { useState, useRef, useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, Download, X, ChevronDown } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════
   PALETTES
   ═══════════════════════════════════════════════════════════════════════ */

const PALETTES = {
    terracotta: {
        name: "Terracotta", preview: "#C2703E",
        bg: "#FDF6F0", surface: "#FFFFFF", surfaceAlt: "#F7EDE4",
        primary: "#C2703E", primaryHover: "#A85D32",
        text: "#3D2B1F", textLight: "#9B8574", textMuted: "#C4AD9C",
        border: "#E8D5C4", borderLight: "#F0E4D8",
        axis: "#5C4033", tick: "#9B8574",
        eventColors: ["#C2703E", "#2D6A6A", "#8B5E3C", "#7B6D8E", "#4A8B5E", "#B85450"],
    },
    ocean: {
        name: "Océan", preview: "#1B6B93",
        bg: "#F0F6FA", surface: "#FFFFFF", surfaceAlt: "#E2EFF7",
        primary: "#1B6B93", primaryHover: "#155A7D",
        text: "#1A2F3F", textLight: "#6B8EA0", textMuted: "#A3C0D0",
        border: "#C5D9E4", borderLight: "#DCE9F0",
        axis: "#2E4057", tick: "#6B8EA0",
        eventColors: ["#1B6B93", "#D4883E", "#2E8B7A", "#5B82C4", "#8B5E6B", "#3E8B4A"],
    },
    forest: {
        name: "Forêt", preview: "#4A7C59",
        bg: "#F2F7F0", surface: "#FFFFFF", surfaceAlt: "#E3EFE0",
        primary: "#4A7C59", primaryHover: "#3D6A4B",
        text: "#2C3527", textLight: "#7A8B72", textMuted: "#AAB8A4",
        border: "#C3D5BE", borderLight: "#D8E5D4",
        axis: "#3D5C45", tick: "#7A8B72",
        eventColors: ["#4A7C59", "#C47D3B", "#5C7C8B", "#8B6B4A", "#6B5C8B", "#8B4A5C"],
    },
    lavande: {
        name: "Lavande", preview: "#7B5EA7",
        bg: "#F5F2FA", surface: "#FFFFFF", surfaceAlt: "#EBE2F5",
        primary: "#7B5EA7", primaryHover: "#69508F",
        text: "#2D2438", textLight: "#8B7A9C", textMuted: "#B8AAC8",
        border: "#D5C4E0", borderLight: "#E5D9EE",
        axis: "#4A3D5C", tick: "#8B7A9C",
        eventColors: ["#7B5EA7", "#C47D6B", "#5C8BA7", "#A07BC4", "#6B8B5C", "#B85480"],
    },
    ardoise: {
        name: "Ardoise", preview: "#4A5568",
        bg: "#F7F8FA", surface: "#FFFFFF", surfaceAlt: "#EBEDF0",
        primary: "#4A5568", primaryHover: "#3D4759",
        text: "#1A202C", textLight: "#8B96A5", textMuted: "#B8C0CC",
        border: "#D1D5DB", borderLight: "#E2E5EA",
        axis: "#2D3748", tick: "#8B96A5",
        eventColors: ["#4A5568", "#C05B3E", "#2D6A6A", "#7B5EA7", "#8B6B4A", "#5A7F6E"],
    },
};

const PERIOD_UNITS = [
    { value: "days", label: "Jours" },
    { value: "weeks", label: "Semaines" },
    { value: "months", label: "Mois" },
    { value: "years", label: "Années" },
    { value: "centuries", label: "Siècles" },
    { value: "millennia", label: "Millénaires" },
];

const PRECISION_OPTIONS = [
    { value: "year", label: "Année" },
    { value: "month", label: "Mois" },
    { value: "day", label: "Jour" },
];

const MONTHS_FR = [
    { value: 1, label: "Janvier" }, { value: 2, label: "Février" }, { value: 3, label: "Mars" },
    { value: 4, label: "Avril" }, { value: 5, label: "Mai" }, { value: 6, label: "Juin" },
    { value: 7, label: "Juillet" }, { value: 8, label: "Août" }, { value: 9, label: "Septembre" },
    { value: 10, label: "Octobre" }, { value: 11, label: "Novembre" }, { value: 12, label: "Décembre" },
];

const CANVAS_PAD = { left: 70, right: 50, top: 30, bottom: 65 };
const TITLE_HEIGHT = 40;
const ROW_HEIGHT = 80;
const BAR_HEIGHT = 28;
const BASE_CANVAS_HEIGHT = 150;

/* ═══════════════════════════════════════════════════════════════════════
   FLEXDATE MODEL
   { year: number|"", month: number, day: number, precision: "year"|"month"|"day" }
   Supports negative years for BC dates.
   ═══════════════════════════════════════════════════════════════════════ */

const EMPTY_FLEXDATE = { year: "", month: 1, day: 1, precision: "year" };

function isFlexDateValid(fd) {
    if (!fd || fd.year === "" || fd.year === null || fd.year === undefined || fd.year === "-") return false;
    return Number.isFinite(Number(fd.year));
}

function flexToTimestamp(fd) {
    if (!isFlexDateValid(fd)) return null;
    const y = Number(fd.year);
    const m = fd.precision === "year" ? 0 : (fd.month || 1) - 1;
    const d = fd.precision === "day" ? (fd.day || 1) : 1;
    const date = new Date(Date.UTC(2000, m, d));
    date.setUTCFullYear(y);
    return date.getTime();
}

function flexCompare(a, b) {
    const ta = flexToTimestamp(a), tb = flexToTimestamp(b);
    if (ta === null || tb === null) return 0;
    return ta - tb;
}

function flexAfter(a, b) { return flexCompare(a, b) > 0; }
function flexEqual(a, b) {
    if (!isFlexDateValid(a) || !isFlexDateValid(b)) return false;
    return flexToTimestamp(a) === flexToTimestamp(b);
}

function addDurationToFlex(fd, qty, unit) {
    if (!isFlexDateValid(fd) || !qty) return null;
    const q = parseInt(qty, 10);
    if (isNaN(q)) return null;
    const y = Number(fd.year);
    const m = (fd.month || 1) - 1;
    const d = fd.day || 1;
    const date = new Date(Date.UTC(2000, m, d));
    date.setUTCFullYear(y);

    const ops = {
        days: () => date.setUTCDate(date.getUTCDate() + q),
        weeks: () => date.setUTCDate(date.getUTCDate() + q * 7),
        months: () => date.setUTCMonth(date.getUTCMonth() + q),
        years: () => date.setUTCFullYear(date.getUTCFullYear() + q),
        centuries: () => date.setUTCFullYear(date.getUTCFullYear() + q * 100),
        millennia: () => date.setUTCFullYear(date.getUTCFullYear() + q * 1000),
    };
    (ops[unit] || (() => {}))();

    return {
        year: date.getUTCFullYear(),
        month: date.getUTCMonth() + 1,
        day: date.getUTCDate(),
        precision: fd.precision,
    };
}

function computeDurationBetween(a, b) {
    const ta = flexToTimestamp(a), tb = flexToTimestamp(b);
    if (ta === null || tb === null || tb <= ta) return null;
    const diffDays = Math.round((tb - ta) / 864e5);
    const ya = Number(a.year), yb = Number(b.year);
    const months = (yb - ya) * 12 + ((b.month || 1) - (a.month || 1));
    const years = yb - ya;
    if (diffDays <= 90) return { qty: diffDays, unit: "days" };
    if (diffDays <= 400) return { qty: Math.round(diffDays / 7), unit: "weeks" };
    if (months <= 36) return { qty: months, unit: "months" };
    if (years <= 300) return { qty: years, unit: "years" };
    if (years <= 5000) return { qty: Math.round(years / 100), unit: "centuries" };
    return { qty: Math.round(years / 1000), unit: "millennia" };
}

function formatFlexDate(fd) {
    if (!isFlexDateValid(fd)) return "";
    const y = Number(fd.year);
    const yearStr = y < 0 ? `${Math.abs(y)} av. J.-C.` : `${y}`;
    if (fd.precision === "year") return yearStr;
    const monthName = MONTHS_FR[(fd.month || 1) - 1]?.label || "";
    if (fd.precision === "month") return `${monthName} ${yearStr}`;
    return `${fd.day || 1} ${monthName.toLowerCase()} ${yearStr}`;
}

function formatFlexTickLabel(fd, unit) {
    if (!isFlexDateValid(fd)) return "";
    const y = Number(fd.year);
    const yearStr = y < 0 ? `${Math.abs(y)} av. J.-C.` : `${y}`;
    if (unit === "days" || unit === "weeks") {
        const mShort = MONTHS_FR[(fd.month || 1) - 1]?.label.slice(0, 3) || "";
        return `${fd.day || 1} ${mShort}`;
    }
    if (unit === "months") {
        const mShort = MONTHS_FR[(fd.month || 1) - 1]?.label.slice(0, 3) || "";
        return `${mShort} ${yearStr}`;
    }
    return yearStr;
}

function generateFlexTicks(start, end, qty, unit) {
    if (!isFlexDateValid(start) || !isFlexDateValid(end) || !qty) return [];
    const ticks = [];
    const endTs = flexToTimestamp(end);
    let cur = { ...start };
    for (let i = 0; i < 500; i++) {
        if (!isFlexDateValid(cur)) break;
        const ts = flexToTimestamp(cur);
        if (ts > endTs) break;
        ticks.push({ ...cur });
        const next = addDurationToFlex(cur, qty, unit);
        if (!next || flexEqual(next, cur)) break;
        cur = next;
    }
    return ticks;
}

function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

/* ═══════════════════════════════════════════════════════════════════════
   CONFIG AUTO-COMPUTE
   ═══════════════════════════════════════════════════════════════════════ */

function autoComputeConfig(cfg, changed) {
    const next = { ...cfg };
    const hasStart = isFlexDateValid(next.startDate);
    const hasEnd = isFlexDateValid(next.endDate);
    const hasDur = !!next.durationQty && parseInt(next.durationQty, 10) > 0;

    if (changed === "startDate" || changed === "endDate") {
        if (hasStart && hasEnd) {
            const dur = computeDurationBetween(next.startDate, next.endDate);
            if (dur) { next.durationQty = dur.qty; next.durationUnit = dur.unit; next.computed = "duration"; }
        } else if (changed === "startDate" && hasStart && hasDur) {
            const end = addDurationToFlex(next.startDate, next.durationQty, next.durationUnit);
            if (end) { next.endDate = end; next.computed = "end"; }
        } else if (changed === "endDate" && hasEnd && hasDur) {
            const start = addDurationToFlex(next.endDate, -parseInt(next.durationQty), next.durationUnit);
            if (start) { next.startDate = start; next.computed = "start"; }
        }
    } else if (changed === "durationQty" || changed === "durationUnit") {
        if (hasDur && hasStart) {
            const end = addDurationToFlex(next.startDate, next.durationQty, next.durationUnit);
            if (end) { next.endDate = end; next.computed = "end"; }
        } else if (hasDur && hasEnd) {
            const start = addDurationToFlex(next.endDate, -parseInt(next.durationQty), next.durationUnit);
            if (start) { next.startDate = start; next.computed = "start"; }
        }
    }
    return next;
}

/* ═══════════════════════════════════════════════════════════════════════
   CANVAS RENDERING
   ═══════════════════════════════════════════════════════════════════════ */

function computeEventLayout(events, dateToX) {
    const sorted = [...events].sort((a, b) => flexCompare(a.startDate, b.startDate));
    const rows = [];

    return sorted.map(ev => {
        const x = dateToX(ev.startDate);
        const ex = ev.endDate ? dateToX(ev.endDate) : null;
        const titleW = ev.title.length * 7.5 + 40;
        const descW = ev.description ? Math.min(ev.description.length * 6.5 + 20, 220) : 0;
        const labelW = Math.max(titleW, descW);
        const visLeft = x - 4;
        const visRight = ex ? Math.max(ex + 8, x + titleW) : x + labelW;

        let row = 0;
        while (rows[row]?.some(r => !(visRight < r.l || visLeft > r.r))) row++;
        if (!rows[row]) rows[row] = [];
        rows[row].push({ l: visLeft, r: visRight });

        return { ...ev, row, x, ex };
    });
}

function wrapText(ctx, text, maxWidth, maxLines) {
    const words = text.split(/\s+/).filter(w => w);
    if (words.length === 0) return [];
    const lines = [];
    let current = "";

    for (const word of words) {
        const test = current ? current + " " + word : word;
        if (ctx.measureText(test).width <= maxWidth) {
            current = test;
        } else {
            if (current) lines.push(current);
            current = word;
        }
    }
    if (current) lines.push(current);

    const overflow = lines.length > maxLines;
    if (overflow) lines.length = maxLines;

    for (let i = 0; i < lines.length; i++) {
        const needsEllipsis = (i === lines.length - 1 && overflow) || ctx.measureText(lines[i]).width > maxWidth;
        if (needsEllipsis) {
            let line = lines[i];
            while (ctx.measureText(line + "…").width > maxWidth && line.length > 1) line = line.slice(0, -1).trimEnd();
            lines[i] = line + "…";
        }
    }

    return lines;
}

function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function renderTimeline(ctx, W, H, config, events, palette, images, title) {
    const font = "Outfit, system-ui, sans-serif";

    ctx.fillStyle = palette.surface;
    ctx.fillRect(0, 0, W, H);

    const titleH = title ? TITLE_HEIGHT : 0;
    const axisY = H - CANVAS_PAD.bottom;
    const axisLeft = CANVAS_PAD.left;
    const axisRight = W - CANVAS_PAD.right;
    const startTs = flexToTimestamp(config.startDate);
    const endTs = flexToTimestamp(config.endDate);
    if (!startTs || !endTs || endTs <= startTs) return;

    const span = endTs - startTs;
    const dateToX = (fd) => {
        const ts = flexToTimestamp(fd);
        if (ts === null) return axisLeft;
        return axisLeft + ((ts - startTs) / span) * (axisRight - axisLeft);
    };

    // Axis line
    ctx.strokeStyle = palette.axis;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(axisLeft, axisY);
    ctx.lineTo(axisRight, axisY);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = palette.axis;
    ctx.beginPath();
    ctx.moveTo(axisRight + 2, axisY);
    ctx.lineTo(axisRight - 10, axisY - 7);
    ctx.lineTo(axisRight - 10, axisY + 7);
    ctx.closePath();
    ctx.fill();

    // Start cap
    ctx.beginPath();
    ctx.moveTo(axisLeft, axisY - 8);
    ctx.lineTo(axisLeft, axisY + 8);
    ctx.stroke();

    // Ticks
    const ticks = generateFlexTicks(config.startDate, config.endDate, config.periodicityQty, config.periodicityUnit);

    const showLabel = ticks.map(() => true);
    if (ticks.length > 1) {
        const minGap = 55;
        let lastShownX = -Infinity;
        for (let i = 0; i < ticks.length; i++) {
            const tx = dateToX(ticks[i]);
            if (tx - lastShownX < minGap && i > 0 && i < ticks.length - 1) {
                showLabel[i] = false;
            } else {
                lastShownX = tx;
            }
        }
    }

    ticks.forEach((tick, i) => {
        const tx = dateToX(tick);
        ctx.strokeStyle = palette.tick;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tx, axisY - 6);
        ctx.lineTo(tx, axisY + 6);
        ctx.stroke();

        if (showLabel[i]) {
            const isFirst = i === 0;
            const isLast = i === ticks.length - 1;
            ctx.fillStyle = (isFirst || isLast) ? palette.text : palette.textLight;
            ctx.font = (isFirst || isLast) ? `500 11px ${font}` : `400 11px ${font}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            const label = isFirst ? formatFlexDate(config.startDate)
                : isLast ? formatFlexDate(config.endDate)
                : formatFlexTickLabel(tick, config.periodicityUnit);
            ctx.fillText(label, tx, axisY + 12);
        }
    });

    // Events
    const layout = computeEventLayout(events, dateToX);

    layout.forEach((ev) => {
        const colorIdx = events.findIndex(e => e.id === ev.id) % palette.eventColors.length;
        const color = palette.eventColors[colorIdx];
        const rowY = axisY - 18 - (ev.row + 1) * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;

        if (ev.ex !== null) {
            const barW = Math.max(ev.ex - ev.x, 30);

            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = color + "55";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ev.x, rowY + BAR_HEIGHT);
            ctx.lineTo(ev.x, axisY);
            ctx.moveTo(ev.ex, rowY + BAR_HEIGHT);
            ctx.lineTo(ev.ex, axisY);
            ctx.stroke();
            ctx.restore();

            ctx.fillStyle = color + "22";
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.5;
            roundRect(ctx, ev.x, rowY, barW, BAR_HEIGHT, 5);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = palette.text;
            ctx.font = `500 12px ${font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            const maxTextW = barW - 14;
            let title = ev.title;
            while (ctx.measureText(title).width > maxTextW && title.length > 1) title = title.slice(0, -1);
            if (title !== ev.title) title += "…";
            ctx.fillText(title, ev.x + 7, rowY + BAR_HEIGHT / 2);

            if (ev.description) {
                ctx.fillStyle = palette.textMuted;
                ctx.font = `400 10px ${font}`;
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const maxDescW = barW - 14;
                if (maxDescW > 20) {
                    const descLines = wrapText(ctx, ev.description, maxDescW, 3);
                    descLines.forEach((line, i) => {
                        ctx.fillText(line, ev.x + 7, rowY + BAR_HEIGHT + 3 + i * 14);
                    });
                }
            }
        } else {
            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = color + "66";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(ev.x, rowY + BAR_HEIGHT / 2 + 7);
            ctx.lineTo(ev.x, axisY);
            ctx.stroke();
            ctx.restore();

            ctx.beginPath();
            ctx.arc(ev.x, rowY + BAR_HEIGHT / 2, 6, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = palette.surface;
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.fillStyle = palette.text;
            ctx.font = `500 12px ${font}`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.fillText(ev.title, ev.x + 14, rowY + BAR_HEIGHT / 2);

            if (ev.description) {
                ctx.fillStyle = palette.textMuted;
                ctx.font = `400 10px ${font}`;
                ctx.textAlign = "left";
                ctx.textBaseline = "top";
                const maxDescW = 200;
                const descLines = wrapText(ctx, ev.description, maxDescW, 3);
                descLines.forEach((line, i) => {
                    ctx.fillText(line, ev.x + 14, rowY + BAR_HEIGHT / 2 + 10 + i * 14);
                });
            }
        }

        const img = images?.[ev.id];
        if (img) {
            const maxSize = 128;
            const natW = img.naturalWidth;
            const natH = img.naturalHeight;
            const bigger = Math.max(natW, natH);
            const scale = bigger > maxSize ? maxSize / bigger : 1;
            const drawW = natW * scale;
            const drawH = natH * scale;
            const imgX = ev.x - drawW / 2;
            const imgY = rowY - drawH - 4;
            ctx.save();
            roundRect(ctx, imgX, imgY, drawW, drawH, 4);
            ctx.clip();
            ctx.drawImage(img, imgX, imgY, drawW, drawH);
            ctx.restore();
        }
    });

    // Title section — drawn last so it's always above event content
    if (title) {
        ctx.fillStyle = palette.surface;
        ctx.fillRect(0, 0, W, titleH);
        ctx.fillStyle = palette.text;
        ctx.font = `600 16px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(title, W / 2, titleH / 2);
    }
}

/* ═══════════════════════════════════════════════════════════════════════
   REUSABLE INPUT COMPONENTS
   ═══════════════════════════════════════════════════════════════════════ */

function Label({ children, sub, palette }) {
    return (
        <label style={{ color: palette.text }} className="block text-xs font-semibold mb-1">
            {children}
            {sub && <span style={{ color: palette.textMuted }} className="font-normal ml-1">{sub}</span>}
        </label>
    );
}

function Input({ palette, computed, className = "", ...props }) {
    return (
        <input
            {...props}
            className={`w-full rounded-lg px-3 py-2 text-sm outline-none transition-all ${className}`}
            style={{
                background: computed ? palette.surfaceAlt : palette.surface,
                border: `1.5px solid ${palette.border}`,
                color: palette.text,
                fontStyle: computed ? "italic" : "normal",
                ...(props.style || {}),
            }}
            onFocus={(e) => { e.target.style.borderColor = palette.primary; props.onFocus?.(e); }}
            onBlur={(e) => { e.target.style.borderColor = palette.border; props.onBlur?.(e); }}
        />
    );
}

function Select({ palette, options, className = "", ...props }) {
    return (
        <div className={`relative ${className}`}>
            <select
                {...props}
                className="w-full rounded-lg px-3 py-2 text-sm outline-none appearance-none pr-8 cursor-pointer transition-all"
                style={{ background: palette.surface, border: `1.5px solid ${palette.border}`, color: palette.text, colorScheme: "light" }}
            >
                {options.map(o => <option key={o.value} value={o.value} style={{ color: palette.text, background: palette.surface }}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: palette.textLight }} />
        </div>
    );
}

function Btn({ palette, variant = "primary", className = "", children, ...props }) {
    const isPrimary = variant === "primary";
    return (
        <button
            {...props}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${className}`}
            style={{
                background: isPrimary ? palette.primary : "transparent",
                color: isPrimary ? "#fff" : palette.primary,
                border: isPrimary ? "none" : `1.5px solid ${palette.border}`,
                opacity: props.disabled ? 0.5 : 1,
            }}
            onMouseEnter={(e) => { if (!props.disabled) e.target.style.background = isPrimary ? palette.primaryHover : palette.surfaceAlt; }}
            onMouseLeave={(e) => { e.target.style.background = isPrimary ? palette.primary : "transparent"; }}
        >
            {children}
        </button>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   FLEXDATE INPUT COMPONENT
   Toggle between Année / Mois / Jour precision. Adapts fields shown.
   ═══════════════════════════════════════════════════════════════════════ */

function DateInput({ value, onChange, palette, computed = false, label, sub }) {
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

/* ═══════════════════════════════════════════════════════════════════════
   CONFIG PANEL
   ═══════════════════════════════════════════════════════════════════════ */

function ConfigPanel({ config, onChange, palette, title, onTitleChange }) {
    const handleDate = (field) => (fd) => onChange(field, fd);
    const handle = (field) => (e) => onChange(field, e.target.value);

    return (
        <div className="space-y-3">
            <h3 style={{ color: palette.text }} className="text-sm font-bold tracking-wide uppercase opacity-60 mb-3">
                Configuration
            </h3>

            <div>
                <Label palette={palette}>Titre</Label>
                <Input
                    palette={palette}
                    value={title}
                    onChange={(e) => onTitleChange(e.target.value)}
                    placeholder="Ma frise chronologique"
                />
            </div>

            <DateInput
                label="Date de début"
                sub={config.computed === "start" ? "(calculé)" : ""}
                palette={palette}
                computed={config.computed === "start"}
                value={config.startDate}
                onChange={handleDate("startDate")}
            />

            <DateInput
                label="Date de fin"
                sub={config.computed === "end" ? "(calculé)" : ""}
                palette={palette}
                computed={config.computed === "end"}
                value={config.endDate}
                onChange={handleDate("endDate")}
            />

            <div>
                <Label palette={palette} sub={config.computed === "duration" ? "(calculé)" : ""}>Durée</Label>
                <div className="flex gap-2">
                    <div className="w-24">
                        <Input
                            type="number" min="1" palette={palette}
                            value={config.durationQty}
                            onChange={handle("durationQty")}
                            computed={config.computed === "duration"}
                            placeholder="—"
                        />
                    </div>
                    <div className="flex-1">
                        <Select palette={palette} value={config.durationUnit} onChange={handle("durationUnit")} options={PERIOD_UNITS} />
                    </div>
                </div>
            </div>

            <hr style={{ borderColor: palette.borderLight }} className="my-4" />

            <div>
                <Label palette={palette}>Périodicité</Label>
                <div className="flex gap-2">
                    <div className="w-24">
                        <Input type="number" min="1" palette={palette} value={config.periodicityQty} onChange={handle("periodicityQty")} />
                    </div>
                    <div className="flex-1">
                        <Select palette={palette} value={config.periodicityUnit} onChange={handle("periodicityUnit")} options={PERIOD_UNITS} />
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   EVENT MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function EventModal({ onSubmit, onClose, initial, palette }) {
    const [form, setForm] = useState({
        title: initial?.title || "",
        startDate: initial?.startDate || { ...EMPTY_FLEXDATE },
        endDate: initial?.endDate || null,
        description: initial?.description || "",
        image: initial?.image || null,
        hasEndDate: !!initial?.endDate,
    });
    const [errors, setErrors] = useState({});

    const setField = (field) => (val) => setForm(p => ({ ...p, [field]: val }));

    const handleImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setForm(p => ({ ...p, image: ev.target.result }));
        reader.readAsDataURL(file);
    };

    const validate = () => {
        const errs = {};
        if (!form.title.trim()) errs.title = "Titre requis";
        if (!isFlexDateValid(form.startDate)) errs.startDate = "Date requise";
        if (form.hasEndDate && form.endDate) {
            if (!isFlexDateValid(form.endDate)) {
                errs.endDate = "Date invalide";
            } else if (!flexAfter(form.endDate, form.startDate)) {
                errs.endDate = "Doit être après la date de début";
            }
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const submit = () => {
        if (!validate()) return;
        onSubmit({
            title: form.title.trim(),
            startDate: form.startDate,
            endDate: form.hasEndDate && isFlexDateValid(form.endDate) ? form.endDate : null,
            description: form.description.trim() || null,
            image: form.image,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
            <div
                className="relative rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4 max-h-[90vh] overflow-y-auto"
                style={{ background: palette.surface }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h3 style={{ color: palette.text }} className="text-lg font-bold">
                        {initial ? "Modifier l'événement" : "Nouvel événement"}
                    </h3>
                    <button onClick={onClose} className="p-1 rounded-lg cursor-pointer transition-colors hover:bg-black/5">
                        <X size={18} style={{ color: palette.textLight }} />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label palette={palette}>Titre *</Label>
                        <Input
                            palette={palette}
                            value={form.title}
                            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                            placeholder="Ex: Révolution française"
                        />
                        {errors.title && <p className="text-xs mt-1 text-red-500">{errors.title}</p>}
                    </div>

                    <DateInput
                        label="Date de début *"
                        palette={palette}
                        value={form.startDate}
                        onChange={setField("startDate")}
                    />
                    {errors.startDate && <p className="text-xs -mt-2 text-red-500">{errors.startDate}</p>}

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer mb-2">
                            <input
                                type="checkbox"
                                checked={form.hasEndDate}
                                onChange={(e) => setForm(p => ({
                                    ...p,
                                    hasEndDate: e.target.checked,
                                    endDate: e.target.checked ? (p.endDate || { ...EMPTY_FLEXDATE }) : null,
                                }))}
                                className="rounded cursor-pointer"
                                style={{ accentColor: palette.primary }}
                            />
                            <span style={{ color: palette.text }} className="text-xs font-semibold">Période (date de fin)</span>
                        </label>
                        {form.hasEndDate && (
                            <DateInput
                                palette={palette}
                                value={form.endDate || EMPTY_FLEXDATE}
                                onChange={setField("endDate")}
                            />
                        )}
                        {errors.endDate && <p className="text-xs mt-1 text-red-500">{errors.endDate}</p>}
                    </div>

                    <div>
                        <Label palette={palette} sub="(optionnel)">Description</Label>
                        <textarea
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            rows={2}
                            style={{ background: palette.surface, border: `1.5px solid ${palette.border}`, color: palette.text }}
                            value={form.description}
                            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                            placeholder="Détails supplémentaires…"
                        />
                    </div>

                    <div>
                        <Label palette={palette} sub="(optionnel)">Image</Label>
                        <div className="flex items-center gap-3">
                            <label
                                className="rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors flex items-center gap-2"
                                style={{ border: `1.5px solid ${palette.border}`, color: palette.textLight }}
                            >
                                <Download size={14} />
                                Choisir un fichier
                                <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                            </label>
                            {form.image && (
                                <div className="flex items-center gap-2">
                                    <img src={form.image} alt="" className="w-8 h-8 rounded object-cover" />
                                    <button onClick={() => setForm(p => ({ ...p, image: null }))} className="text-red-400 cursor-pointer">
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                    <Btn palette={palette} variant="ghost" onClick={onClose}>Annuler</Btn>
                    <Btn palette={palette} onClick={submit}>{initial ? "Modifier" : "Ajouter"}</Btn>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   EVENT LIST
   ═══════════════════════════════════════════════════════════════════════ */

function EventList({ events, palette, onEdit, onDelete }) {
    if (events.length === 0) {
        return (
            <p style={{ color: palette.textMuted }} className="text-sm text-center py-6 italic">
                Aucun événement. Cliquez sur « Ajouter » pour commencer.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {events.map((ev, idx) => {
                const color = palette.eventColors[idx % palette.eventColors.length];
                return (
                    <div
                        key={ev.id}
                        className="rounded-xl p-3 flex gap-3 group transition-colors"
                        style={{ background: palette.surfaceAlt, borderLeft: `3px solid ${color}` }}
                    >
                        {ev.image && <img src={ev.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                            <p style={{ color: palette.text }} className="text-sm font-semibold truncate">{ev.title}</p>
                            <p style={{ color: palette.textLight }} className="text-xs mt-0.5">
                                {formatFlexDate(ev.startDate)}
                                {ev.endDate && ` → ${formatFlexDate(ev.endDate)}`}
                            </p>
                            {ev.description && (
                                <p style={{ color: palette.textMuted }} className="text-xs mt-1 truncate">{ev.description}</p>
                            )}
                        </div>
                        <div className="flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(ev)} className="p-1.5 rounded-lg cursor-pointer hover:bg-black/5 transition-colors">
                                <Pencil size={13} style={{ color: palette.textLight }} />
                            </button>
                            <button onClick={() => onDelete(ev.id)} className="p-1.5 rounded-lg cursor-pointer hover:bg-red-50 transition-colors">
                                <Trash2 size={13} className="text-red-400" />
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   PALETTE SELECTOR
   ═══════════════════════════════════════════════════════════════════════ */

function PaletteSelector({ current, onChange, palette }) {
    return (
        <div className="flex items-center gap-2">
            <span style={{ color: palette.textLight }} className="text-xs font-medium">Thème</span>
            <div className="flex gap-1.5">
                {Object.entries(PALETTES).map(([key, p]) => (
                    <button
                        key={key}
                        onClick={() => onChange(key)}
                        className="w-6 h-6 rounded-full cursor-pointer transition-all"
                        style={{
                            background: p.preview,
                            boxShadow: current === key ? `0 0 0 2px ${palette.surface}, 0 0 0 3.5px ${p.preview}` : "none",
                            transform: current === key ? "scale(1.15)" : "scale(1)",
                        }}
                        title={p.name}
                    />
                ))}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════════════════════ */

export default function TimelineApp() {
    const [config, setConfig] = useState({
        startDate: { ...EMPTY_FLEXDATE },
        endDate: { ...EMPTY_FLEXDATE },
        durationQty: "",
        durationUnit: "months",
        periodicityQty: 1,
        periodicityUnit: "years",
        computed: null,
    });
    const [events, setEvents] = useState([]);
    const [title, setTitle] = useState("");
    const [paletteName, setPaletteName] = useState("terracotta");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [canvasWidth, setCanvasWidth] = useState(800);

    const palette = PALETTES[paletteName];
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const handleConfigChange = (field, value) => {
        setConfig(prev => autoComputeConfig({ ...prev, [field]: value }, field));
    };

    const isConfigValid = useMemo(() => {
        return isFlexDateValid(config.startDate)
            && isFlexDateValid(config.endDate)
            && flexAfter(config.endDate, config.startDate)
            && config.periodicityQty > 0;
    }, [config]);

    const numEventRows = useMemo(() => {
        if (!isConfigValid || events.length === 0) return 0;
        const startTs = flexToTimestamp(config.startDate);
        const endTs = flexToTimestamp(config.endDate);
        const span = endTs - startTs;
        if (span <= 0) return 0;
        const dateToX = (fd) => {
            const ts = flexToTimestamp(fd);
            return CANVAS_PAD.left + ((ts - startTs) / span) * (canvasWidth - CANVAS_PAD.left - CANVAS_PAD.right);
        };
        const layout = computeEventLayout(events, dateToX);
        return layout.length > 0 ? Math.max(...layout.map(ev => ev.row)) + 1 : 0;
    }, [events, config, canvasWidth, isConfigValid]);

    const titleH = title.trim() ? TITLE_HEIGHT : 0;
    const canvasHeight = BASE_CANVAS_HEIGHT + numEventRows * ROW_HEIGHT + titleH;

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(entries => setCanvasWidth(Math.max(entries[0].contentRect.width, 500)));
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        if (!isConfigValid) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        (async () => {
            await document.fonts.ready;
            const images = {};
            await Promise.all(events.filter(e => e.image).map(e =>
                new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { images[e.id] = img; resolve(); };
                    img.onerror = resolve;
                    img.src = e.image;
                })
            ));

            const dpr = window.devicePixelRatio || 1;
            canvas.width = canvasWidth * dpr;
            canvas.height = canvasHeight * dpr;
            canvas.style.width = canvasWidth + "px";
            canvas.style.height = canvasHeight + "px";
            const ctx = canvas.getContext("2d");
            ctx.scale(dpr, dpr);
            renderTimeline(ctx, canvasWidth, canvasHeight, config, events, palette, images, title);
        })();
    }, [config, events, palette, canvasWidth, canvasHeight, isConfigValid, title]);

    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => document.head.removeChild(link);
    }, []);

    const openAdd = () => { setEditingEvent(null); setModalOpen(true); };
    const openEdit = (ev) => { setEditingEvent(ev); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditingEvent(null); };

    const handleEventSubmit = (data) => {
        if (editingEvent) {
            setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...data, id: e.id } : e));
        } else {
            setEvents(prev => [...prev, { ...data, id: crypto.randomUUID() }]);
        }
        closeModal();
    };

    const handleDelete = (id) => setEvents(prev => prev.filter(e => e.id !== id));

    const exportImage = (format) => {
        if (!isConfigValid) return;
        (async () => {
            const images = {};
            await Promise.all(events.filter(e => e.image).map(e =>
                new Promise(resolve => {
                    const img = new Image();
                    img.onload = () => { images[e.id] = img; resolve(); };
                    img.onerror = resolve;
                    img.src = e.image;
                })
            ));

            const scale = 2;
            const expCanvas = document.createElement("canvas");
            expCanvas.width = canvasWidth * scale;
            expCanvas.height = canvasHeight * scale;
            const ctx = expCanvas.getContext("2d");
            ctx.scale(scale, scale);
            renderTimeline(ctx, canvasWidth, canvasHeight, config, events, palette, images, title);

            const mime = format === "jpg" ? "image/jpeg" : "image/png";
            expCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                const slug = title.trim()
                    ? title.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
                    : "frise-chronologique";
                a.download = `${slug}.${format}`;
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
            }, mime, 0.95);
        })();
    };

    return (
        <div className="h-screen flex flex-col" style={{ background: palette.bg, fontFamily: "Outfit, system-ui, sans-serif", color: palette.text }}>
            <header
                className="flex items-center justify-between px-5 py-3 flex-shrink-0"
                style={{ background: palette.surface, borderBottom: `1px solid ${palette.borderLight}` }}
            >
                <h1 className="text-lg font-bold tracking-tight" style={{ color: palette.primary }}>
                    ⏤ Frise Chrono
                </h1>
                <PaletteSelector current={paletteName} onChange={setPaletteName} palette={palette} />
                <div className="flex gap-2">
                    <Btn palette={palette} variant="ghost" disabled={!isConfigValid} onClick={() => exportImage("png")}>
                        <Download size={14} /> PNG
                    </Btn>
                    <Btn palette={palette} variant="ghost" disabled={!isConfigValid} onClick={() => exportImage("jpg")}>
                        <Download size={14} /> JPG
                    </Btn>
                </div>
            </header>

            <div className="flex flex-1 min-h-0">
                <aside
                    className="w-80 flex-shrink-0 overflow-y-auto p-5 space-y-5"
                    style={{ background: palette.surface, borderRight: `1px solid ${palette.borderLight}` }}
                >
                    <ConfigPanel config={config} onChange={handleConfigChange} palette={palette} title={title} onTitleChange={setTitle} />
                    <hr style={{ borderColor: palette.borderLight }} />
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 style={{ color: palette.text }} className="text-sm font-bold tracking-wide uppercase opacity-60">
                                Événements
                            </h3>
                            <Btn palette={palette} className="py-1.5 px-3 text-xs" disabled={!isConfigValid} onClick={openAdd}>
                                <Plus size={14} /> Ajouter
                            </Btn>
                        </div>
                        <EventList events={events} palette={palette} onEdit={openEdit} onDelete={handleDelete} />
                    </div>
                </aside>

                <main className="flex-1 overflow-auto p-6 flex items-start justify-center" ref={containerRef}>
                    {!isConfigValid ? (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 gap-3">
                            <div className="text-5xl">📅</div>
                            <p style={{ color: palette.textLight }} className="text-sm text-center max-w-xs">
                                Renseignez les dates de début, de fin (ou la durée) et la périodicité pour afficher votre frise chronologique.
                            </p>
                        </div>
                    ) : (
                        <div className="w-full">
                            <canvas
                                ref={canvasRef}
                                className="rounded-xl shadow-lg w-full"
                                style={{ background: palette.surface }}
                            />
                        </div>
                    )}
                </main>
            </div>

            {modalOpen && (
                <EventModal
                    palette={palette}
                    initial={editingEvent}
                    onSubmit={handleEventSubmit}
                    onClose={closeModal}
                />
            )}
        </div>
    );
}