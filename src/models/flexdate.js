import { MONTHS_FR } from '../constants/config.js';

export const EMPTY_FLEXDATE = { year: "", month: 1, day: 1, precision: "year" };

export function isFlexDateValid(fd) {
    if (!fd || fd.year === "" || fd.year === null || fd.year === undefined || fd.year === "-") return false;
    return Number.isFinite(Number(fd.year));
}

export function flexToTimestamp(fd) {
    if (!isFlexDateValid(fd)) return null;
    const y = Number(fd.year);
    const m = fd.precision === "year" ? 0 : (fd.month || 1) - 1;
    const d = fd.precision === "day" ? (fd.day || 1) : 1;
    const date = new Date(Date.UTC(2000, m, d));
    date.setUTCFullYear(y);
    return date.getTime();
}

export function flexCompare(a, b) {
    const ta = flexToTimestamp(a), tb = flexToTimestamp(b);
    if (ta === null || tb === null) return 0;
    return ta - tb;
}

export function flexAfter(a, b) {
    return flexCompare(a, b) > 0;
}

export function flexEqual(a, b) {
    if (!isFlexDateValid(a) || !isFlexDateValid(b)) return false;
    return flexToTimestamp(a) === flexToTimestamp(b);
}

export function addDurationToFlex(fd, qty, unit) {
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

export function computeDurationBetween(a, b) {
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

export function formatFlexDate(fd) {
    if (!isFlexDateValid(fd)) return "";
    const y = Number(fd.year);
    const yearStr = y < 0 ? `${Math.abs(y)} av. J.-C.` : `${y}`;
    if (fd.precision === "year") return yearStr;
    const monthName = MONTHS_FR[(fd.month || 1) - 1]?.label || "";
    if (fd.precision === "month") return `${monthName} ${yearStr}`;
    return `${fd.day || 1} ${monthName.toLowerCase()} ${yearStr}`;
}

export function formatFlexTickLabel(fd, unit) {
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

export function generateFlexTicks(start, end, qty, unit) {
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

export function daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
