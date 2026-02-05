import { flexCompare } from '../models/flexdate.js';

export function computeEventLayout(events, dateToX) {
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

export function wrapText(ctx, text, maxWidth, maxLines) {
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
            while (ctx.measureText(line + "\u2026").width > maxWidth && line.length > 1) line = line.slice(0, -1).trimEnd();
            lines[i] = line + "\u2026";
        }
    }

    return lines;
}

export function roundRect(ctx, x, y, w, h, r) {
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
